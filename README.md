# GST Invoice Generator

A professional web-based GST invoice generator for Ganesh Engineering Works with customer management, automatic invoice numbering, and mobile-responsive design.

## Features

- **Customer Autocomplete**: Search and auto-fill customer details from database
- **Auto Invoice Numbering**: Automatic sequential invoice number generation
- **GST Calculations**: Support for CGST, SGST, and IGST with automatic calculations
- **Number to Words**: Automatic conversion of invoice amount to words
- **Print to PDF**: Convert invoice to image and print with proper A4 formatting
- **Mobile Responsive**: Fully responsive design for mobile and desktop devices
- **Database Integration**: MongoDB backend for storing invoices and customer data

## Tech Stack

### Frontend
- HTML5
- CSS3 (Grid, Flexbox, Media Queries)
- Vanilla JavaScript
- html2canvas library for PDF generation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- CORS enabled REST API

## Project Structure

```
Ganesh engineering/
├── public/
│   ├── css/
│   │   └── styles.css         # All application styles
│   ├── js/
│   │   └── app.js             # Frontend JavaScript logic
│   ├── images/
│   │   └── ganesh.png         # Company logo
│   └── index.html             # Main HTML file
├── server.js                  # Express backend server
├── package.json               # NPM dependencies
├── requirements.txt           # Azure deployment requirements
└── README.md                  # This file
```

## Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - For local MongoDB: Ensure MongoDB is running on `mongodb://localhost:27017`
   - For MongoDB Atlas: Get your connection string

4. **Configure environment variables** (optional)
   
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/ganesh_engineering
   PORT=3000
   ```

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will start on `http://localhost:3000`

## Usage

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`

2. **Create an Invoice**
   - Tax Invoice No. is auto-generated
   - Enter customer name (autocomplete suggestions will appear)
   - Fill in customer address and GSTIN
   - Add invoice items with description, HSN/SAC, quantity, and rate
   - Select appropriate tax percentages (CGST/SGST or IGST)
   - Click "Generate Invoice" to preview

3. **Print Invoice**
   - Click "Print Invoice" button
   - The invoice will be converted to an image for consistent formatting
   - Use browser's print dialog to save as PDF or print

4. **Save Invoice**
   - Click "Save Invoice & Print" to save to database
   - The form will reset with the next invoice number

## API Endpoints

### Invoices

- `POST /api/invoices` - Create a new invoice
- `GET /api/invoices/next-number` - Get next available invoice number

### Customers

- `GET /api/customers/search/:query` - Search customers by name

### Database

- `GET /api/database/status` - Check database connection status

## Mobile Responsive Features

- Optimized layout for mobile devices (< 768px)
- Scrollable invoice preview on mobile
- Touch-friendly form inputs
- Print functionality maintains A4 desktop format on all devices

## Azure Deployment

### Prerequisites
- Azure account
- Azure App Service created
- MongoDB Atlas or Azure Cosmos DB with MongoDB API

### Deployment Steps

1. **Prepare the application**
   ```bash
   npm install --production
   ```

2. **Configure Azure App Service**
   - Set `MONGODB_URI` in Application Settings (environment variable)
   - Set `PORT` to `8080` or leave default
   - Set Node.js version to 14 or higher

3. **Deploy using Azure CLI**
   ```bash
   az webapp up --name your-app-name --resource-group your-resource-group
   ```

4. **Or deploy using Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   az webapp deployment source config-local-git --name your-app-name --resource-group your-resource-group
   git remote add azure <deployment-url>
   git push azure main
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ganesh_engineering` |
| `PORT` | Server port number | `3000` |

## Database Schema

### Invoice Document
```javascript
{
  customerDetails: {
    to: String,
    customerAddress: String,
    taxInvoiceNo: Number,
    taxInvoiceDate: Date,
    challanNo: String,
    challanDate: Date,
    poNo: String,
    poDate: Date,
    vendorCode: String,
    vehicleNo: String,
    customerGstin: String
  },
  items: [{
    description: String,
    hsnSac: String,
    quantity: Number,
    rate: Number,
    value: Number
  }],
  taxDetails: {
    subtotal: Number,
    cgstPercent: Number,
    cgstAmount: Number,
    sgstPercent: Number,
    sgstAmount: Number,
    igstPercent: Number,
    igstAmount: Number,
    grandTotal: Number,
    totalInWords: String
  },
  createdAt: Date
}
```

### Customer Document
```javascript
{
  name: String,
  address: String,
  gstin: String,
  createdAt: Date
}
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in environment variables
- For MongoDB Atlas, ensure IP whitelist is configured

### Port Already in Use
- Change the PORT in environment variables
- Or kill the process using port 3000:
  ```bash
  # Windows PowerShell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
  ```

### Print Preview Not Working
- Ensure html2canvas library is loaded (CDN in index.html)
- Check browser console for JavaScript errors
- Try clearing browser cache

## Company Information

**GANESH ENGINEERING WORKS**
- GSTIN: 27CAAPS3055H1ZO
- PAN: CAAPS3055H
- State: Maharashtra (Code: 27)
- Address: Works: Sector No. 7, Plot No. 41, PCNTDA, MIDC Bhosari, Pune - 411026
- Email: ganeshengineering.v@gmail.com
- Phone: +91 8149004679 | +91 9371084724

**Bank Details:**
- Bank: AXIS BANK LTD
- Account No: 912020031078728
- IFSC Code: UTIB0000871
- Branch: AUNDH PUNE

## License

This is a proprietary application developed for Ganesh Engineering Works.

## Support

For technical support or queries, contact:
- Email: ganeshengineering.v@gmail.com
- Phone: +91 8149004679 | +91 9371084724
