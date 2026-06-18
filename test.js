import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/campcart';

mongoose.connect(uri).then(async () => {
    console.log('Connected to DB');
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('users', new mongoose.Schema({}, { strict: false }));
    
    const allProducts = await Product.countDocuments();
    console.log('Total Products:', allProducts);
    
    const vendors = await User.find({ role: 'vendor' });
    console.log('Total Vendors:', vendors.length);
    console.log('Vendor IDs:', vendors.map(v => v._id.toString()));
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    const openVendorIds = vendors.filter(vendor => {
        console.log("Checking vendor:", vendor._id);
        console.log("vendor.businessHours exists?", !!vendor.businessHours);
        if (vendor.businessHours) {
            console.log("vendor.businessHours.get?", typeof vendor.businessHours.get);
            console.log("vendor.businessHours[currentDay]:", vendor.businessHours[currentDay]);
            const mapGet = vendor.businessHours.get ? vendor.businessHours.get(currentDay) : undefined;
            console.log("vendor.businessHours.get(currentDay):", mapGet);
        }

        if (!vendor.businessHours || (!vendor.businessHours[currentDay] && !(vendor.businessHours.get && vendor.businessHours.get(currentDay)))) return true; 
        
        const hours = vendor.businessHours[currentDay] || (vendor.businessHours.get && vendor.businessHours.get(currentDay));
        console.log("hours:", hours);
        if (!hours.isOpen) return false;
        
        const openTime = hours.openTime || "00:00";
        const closeTime = hours.closeTime || "23:59";
        
        if (openTime <= closeTime) {
            return currentTime >= openTime && currentTime <= closeTime;
        } else {
            return currentTime >= openTime || currentTime <= closeTime;
        }
    }).map(v => v._id);
    console.log('Open Vendors:', openVendorIds.length);
    const productsWithOpenVendor = await Product.countDocuments({ vendor: { $in: openVendorIds } });
    console.log('Products with known vendor:', productsWithOpenVendor);

    const firstProduct = await Product.findOne();
    console.log('Sample product vendor:', firstProduct ? firstProduct.vendor : 'None');

    process.exit(0);
}).catch(console.error);
