const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from public directory

// MongoDB Connection
// Replace 'your_mongodb_connection_string' with your actual MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ganesh_engineering';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Counter Schema for auto-increment
const counterSchema = new mongoose.Schema({
    _id: String,
    sequence_value: {
        type: Number,
        default: 0
    }
});

const Counter = mongoose.model('Counter', counterSchema);

// Invoice Schema - Structured as per Excel format
const invoiceSchema = new mongoose.Schema({
    // Customer Details Section
    customerDetails: {
        to: {
            type: String,
            required: true
        },
        customerAddress: String,
        taxInvoiceNo: {
            type: Number,
            unique: true
        },
        taxInvoiceDate: Date,
        challanNo: String,
        challanDate: Date,
        poNo: String,
        poDate: Date,
        vendorCodeNo: String,
        vehicleNo: String,
        gstinNo: String
    },

    // Items Section
    items: [{
        description: {
            type: String,
            required: true
        },
        hsnSac: String,
        quantity: Number,
        rate: Number,
        cgst: Number,
        sgst: Number,
        igst: Number,
        grandTotal: Number
    }],

    // Summary (for reference)
    subtotal: Number,
    totalCgst: Number,
    totalSgst: Number,
    totalIgst: Number,
    finalGrandTotal: Number,
    totalInWords: String,

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Function to get next invoice number
async function getNextInvoiceNumber() {
    const counter = await Counter.findByIdAndUpdate(
        'taxInvoiceNo',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
    );
    return counter.sequence_value;
}

// API Routes

// Get next invoice number
app.get('/api/invoices/next-number', async (req, res) => {
    try {
        // Get the latest invoice to find the highest number
        const latestInvoice = await Invoice.findOne().sort({ 'customerDetails.taxInvoiceNo': -1 });
        let nextNumber = 644; // Starting from 644

        if (latestInvoice && latestInvoice.customerDetails && latestInvoice.customerDetails.taxInvoiceNo) {
            nextNumber = latestInvoice.customerDetails.taxInvoiceNo + 1;
        }

        res.json({
            success: true,
            nextInvoiceNumber: nextNumber
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting next invoice number',
            error: error.message
        });
    }
});

// Save Invoice
app.post('/api/invoices', async (req, res) => {
    try {
        // Get next invoice number from database (not counter)
        const latestInvoice = await Invoice.findOne().sort({ 'customerDetails.taxInvoiceNo': -1 });
        let nextNumber = 634; // Start from 632

        if (latestInvoice && latestInvoice.customerDetails && latestInvoice.customerDetails.taxInvoiceNo) {
            nextNumber = latestInvoice.customerDetails.taxInvoiceNo + 1;
        }

        // Restructure data to match new schema
        const invoiceData = {
            customerDetails: {
                to: req.body.customerName,
                customerAddress: req.body.customerAddress,
                taxInvoiceNo: nextNumber,
                taxInvoiceDate: req.body.taxInvoiceDate,
                challanNo: req.body.challanNo,
                challanDate: req.body.challanDate,
                poNo: req.body.poNo,
                poDate: req.body.poDate,
                vendorCodeNo: req.body.vendorCode,
                vehicleNo: req.body.vehicleNo,
                gstinNo: req.body.customerGstin
            },
            items: req.body.items.map(item => ({
                description: item.description,
                hsnSac: item.hsnSac,
                quantity: item.quantity,
                rate: item.rate,
                cgst: (item.value * (req.body.cgstPercent || 0)) / 100,
                sgst: (item.value * (req.body.sgstPercent || 0)) / 100,
                igst: (item.value * (req.body.igstPercent || 0)) / 100,
                grandTotal: item.value +
                    (item.value * (req.body.cgstPercent || 0)) / 100 +
                    (item.value * (req.body.sgstPercent || 0)) / 100 +
                    (item.value * (req.body.igstPercent || 0)) / 100
            })),
            subtotal: req.body.subtotal,
            totalCgst: req.body.cgstAmount,
            totalSgst: req.body.sgstAmount,
            totalIgst: req.body.igstAmount,
            finalGrandTotal: req.body.grandTotal,
            totalInWords: req.body.totalInWords
        };

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        res.status(201).json({
            success: true,
            message: 'Invoice saved successfully',
            invoiceId: invoice._id,
            taxInvoiceNo: nextNumber
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error saving invoice',
            error: error.message
        });
    }
});

// Get all customers (unique)
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await Invoice.aggregate([
            {
                $group: {
                    _id: {
                        to: "$customerDetails.to",
                        address: "$customerDetails.customerAddress",
                        gstin: "$customerDetails.gstinNo"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id.to",
                    address: "$_id.address",
                    gstin: "$_id.gstin"
                }
            },
            {
                $sort: { name: 1 }
            }
        ]);

        res.json({
            success: true,
            customers: customers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
});

// Search customer by name
app.get('/api/customers/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const customers = await Invoice.aggregate([
            {
                $match: {
                    "customerDetails.to": { $regex: query, $options: 'i' }
                }
            },
            {
                $group: {
                    _id: {
                        to: "$customerDetails.to",
                        address: "$customerDetails.customerAddress",
                        gstin: "$customerDetails.gstinNo"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id.to",
                    address: "$_id.address",
                    gstin: "$_id.gstin"
                }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            success: true,
            customers: customers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching customers',
            error: error.message
        });
    }
});

// Get all invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            invoices: invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices',
            error: error.message
        });
    }
});

// Get invoice by ID
app.get('/api/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }
        res.json({
            success: true,
            invoice: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching invoice',
            error: error.message
        });
    }
});

// Search invoices by challan number
app.get('/api/invoices/search/:challanNo', async (req, res) => {
    try {
        const invoices = await Invoice.find({
            challanNo: new RegExp(req.params.challanNo, 'i')
        }).sort({ createdAt: -1 });
        res.json({
            success: true,
            invoices: invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching invoices',
            error: error.message
        });
    }
});

// Delete invoice
app.delete('/api/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }
        res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting invoice',
            error: error.message
        });
    }
});

// Start server - Listen on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Access from mobile: http://192.168.31.131:${PORT}`);
});
