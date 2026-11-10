import asyncHandler from 'express-async-handler';
import Item from '../models/Item.js';
import ReminderLog from '../models/ReminderLog.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/storageService.js';
import { sendReminderEmail } from '../services/notificationService.js';
import { calculateExpiryDate, calculateStatus } from '../utils/dateCalc.js';

// @desc    Get all items for the logged-in user with search, filter, and sort
// @route   GET /api/items
// @access  Private
export const getItems = asyncHandler(async (req, res) => {
  const { search, category, status, sort } = req.query;

  // Base query strictly scoped to logged-in user
  const query = { user: req.user._id };

  // Category filter
  if (category && category !== 'All') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') };
  }

  // Status filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Search keyword across product name, vendor, serial number, notes
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { productName: searchRegex },
      { vendor: searchRegex },
      { serialNumber: searchRegex },
      { notes: searchRegex },
    ];
  }

  // Sorting
  let sortOption = { expiryDate: 1 }; // default nearest expiry first
  if (sort === 'expiry_desc' || sort === '-expiryDate') {
    sortOption = { expiryDate: -1 };
  } else if (sort === 'name_asc') {
    sortOption = { productName: 1 };
  } else if (sort === 'purchase_desc') {
    sortOption = { purchaseDate: -1 };
  }

  const items = await Item.find(query).sort(sortOption);

  res.json({
    success: true,
    count: items.length,
    items,
  });
});

// @desc    Get aggregate stats for dashboard
// @route   GET /api/items/stats
// @access  Private
export const getStats = asyncHandler(async (req, res) => {
  const items = await Item.find({ user: req.user._id });

  let total = items.length;
  let expiringSoon = 0;
  let expired = 0;
  let active = 0;
  let totalValueProtected = 0;

  items.forEach((item) => {
    // Re-verify real-time status dynamically
    const currentStatus = calculateStatus(item.expiryDate);
    if (currentStatus === 'expiring_soon') expiringSoon++;
    else if (currentStatus === 'expired') expired++;
    else active++;

    if (item.price) totalValueProtected += Number(item.price);
  });

  res.json({
    success: true,
    stats: {
      total,
      expiringSoon,
      expired,
      active,
      totalValueProtected,
    },
  });
});

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Document/Warranty item not found');
  }

  // Verify ownership
  if (item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this vault document');
  }

  res.json({
    success: true,
    item,
  });
});

// @desc    Create and save confirmed item to vault with Cloudinary storage
// @route   POST /api/items
// @access  Private
export const createItem = asyncHandler(async (req, res) => {
  const {
    productName,
    category,
    vendor,
    purchaseDate,
    warrantyPeriodMonths,
    expiryDate: clientExpiryDate,
    price,
    serialNumber,
    notes,
    documentUrl: existingUrl,
    reminderDays,
    extractedRaw,
  } = req.body;

  let documentUrl = existingUrl || '';
  let documentPublicId = '';
  let documentType = 'image/jpeg';

  // If a file was uploaded in this request, stream it to Cloudinary
  if (req.file) {
    documentType = req.file.mimetype;
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'warranty-docs');
      documentUrl = uploadResult.secure_url;
      documentPublicId = uploadResult.public_id;
    } catch (uploadError) {
      console.error('[Cloudinary Upload Error]:', uploadError.message);
      res.status(500);
      throw new Error('Failed to store document in cloud storage, please try again');
    }
  }

  // Calculate expiration date server-side
  let calculatedExpiry = clientExpiryDate ? new Date(clientExpiryDate) : null;
  if (purchaseDate && warrantyPeriodMonths) {
    calculatedExpiry = calculateExpiryDate(purchaseDate, warrantyPeriodMonths);
  }

  if (!calculatedExpiry) {
    res.status(400);
    throw new Error('Please provide valid purchase date and warranty duration or expiry date');
  }

  const computedStatus = calculateStatus(calculatedExpiry);

  // Robust reminder days parsing from JSON or multipart array
  let parsedReminderDays = [30, 7, 1];
  if (Array.isArray(reminderDays)) {
    parsedReminderDays = reminderDays.map(Number).filter((n) => !isNaN(n));
  } else if (req.body['reminderDays[]']) {
    const raw = req.body['reminderDays[]'];
    parsedReminderDays = (Array.isArray(raw) ? raw : [raw]).map(Number).filter((n) => !isNaN(n));
  } else if (typeof reminderDays === 'string' && reminderDays.trim()) {
    try {
      const parsed = JSON.parse(reminderDays);
      if (Array.isArray(parsed)) parsedReminderDays = parsed.map(Number);
      else parsedReminderDays = [Number(reminderDays)];
    } catch {
      parsedReminderDays = reminderDays.split(',').map(Number).filter((n) => !isNaN(n));
    }
  }

  const item = await Item.create({
    user: req.user._id,
    productName,
    category: category || 'Other',
    vendor: vendor || '',
    purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
    warrantyPeriodMonths: Number(warrantyPeriodMonths) || 12,
    expiryDate: calculatedExpiry,
    price: price ? Number(price) : 0,
    serialNumber: serialNumber || '',
    notes: notes || '',
    documentUrl,
    documentPublicId,
    documentType,
    extractedRaw: extractedRaw || null,
    status: computedStatus,
    reminderDays: parsedReminderDays.length ? parsedReminderDays : [30, 7, 1],
    reminderHistory: [
      {
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        channel: 'System',
        message: 'Item registered and encryption protection enabled.',
      },
    ],
  });

  res.status(201).json({
    success: true,
    item,
  });
});

// @desc    Update existing item and handle replacement document upload
// @route   PUT /api/items/:id
// @access  Private
export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Document item not found');
  }

  // Verify ownership
  if (item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this vault record');
  }

  const {
    productName,
    category,
    vendor,
    purchaseDate,
    warrantyPeriodMonths,
    expiryDate: clientExpiryDate,
    price,
    serialNumber,
    notes,
    reminderDays,
  } = req.body;

  // If a replacement file was uploaded, upload new one then remove old asset
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'warranty-docs');
      if (item.documentPublicId) {
        await deleteFromCloudinary(item.documentPublicId);
      }
      item.documentUrl = uploadResult.secure_url;
      item.documentPublicId = uploadResult.public_id;
      item.documentType = req.file.mimetype;
    } catch (uploadError) {
      console.error('[Cloudinary Replacement Upload Error]:', uploadError.message);
      res.status(500);
      throw new Error('Failed to store replacement document in cloud storage, please try again');
    }
  }

  if (productName) item.productName = productName;
  if (category) item.category = category;
  if (vendor !== undefined) item.vendor = vendor;
  if (purchaseDate) item.purchaseDate = new Date(purchaseDate);
  if (warrantyPeriodMonths !== undefined) item.warrantyPeriodMonths = Number(warrantyPeriodMonths);
  if (price !== undefined) item.price = Number(price);
  if (serialNumber !== undefined) item.serialNumber = serialNumber;
  if (notes !== undefined) item.notes = notes;
  if (Array.isArray(reminderDays)) item.reminderDays = reminderDays;

  // Recalculate expiry date if purchaseDate or warrantyPeriodMonths changed
  if (purchaseDate || warrantyPeriodMonths !== undefined) {
    const pDate = purchaseDate || item.purchaseDate;
    const wMonths = warrantyPeriodMonths !== undefined ? warrantyPeriodMonths : item.warrantyPeriodMonths;
    item.expiryDate = calculateExpiryDate(pDate, wMonths) || item.expiryDate;
  } else if (clientExpiryDate) {
    item.expiryDate = new Date(clientExpiryDate);
  }

  item.status = calculateStatus(item.expiryDate);

  const updatedItem = await item.save();

  res.json({
    success: true,
    item: updatedItem,
  });
});

// @desc    Delete item from vault and remove associated Cloudinary attachments and logs
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  // Verify ownership
  if (item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this vault document');
  }

  // Delete from Cloudinary if stored (cleanup failure won't block record deletion)
  if (item.documentPublicId) {
    await deleteFromCloudinary(item.documentPublicId);
  }

  // Delete associated ReminderLogs
  await ReminderLog.deleteMany({ item: item._id });

  // Delete Item record from MongoDB
  await Item.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Item and associated records successfully removed from vault',
  });
});

// @desc    Temporary test route for Cloudinary upload verification
// @route   POST /api/items/test-upload
// @access  Private
// NOTE: Remove before deploying to production
export const testUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select a file to test upload');
  }

  const uploadResult = await uploadToCloudinary(req.file.buffer, 'warranty-docs');
  res.json({
    success: true,
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
    message: 'Cloudinary upload succeeded! Remove this route before deploying to production.',
  });
});

// @desc    Temporary test route for Resend email reminder verification
// @route   POST /api/items/test-email
// @access  Private
// NOTE: Remove before deploying to production
export const testEmail = asyncHandler(async (req, res) => {
  const recipientEmail = req.body?.email || req.user.email || 'expierytracker@gmail.com';
  const recipientName = req.user.name || 'DocAlert User';

  const mockItem = {
    _id: 'test-item-preview',
    productName: req.body?.productName || 'Apple MacBook Pro M3 Max',
    category: 'Electronics',
    vendor: 'Apple Inc.',
    serialNumber: 'C02G4581MD6R',
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  };

  const mockUser = {
    name: recipientName,
    email: recipientEmail,
  };

  const result = await sendReminderEmail(mockItem, mockUser);

  res.json({
    success: true,
    messageId: result.id || result,
    recipient: recipientEmail,
    message: 'Resend test reminder email dispatched successfully! Remove this route before deploying to production.',
  });
});

export default {
  getItems,
  getStats,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  testUpload,
  testEmail,
};
