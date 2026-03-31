# Shipping Provider Logos

Add these logo files to this directory for the shipping providers:

## Required Files

1. `dhl-logo.png` - DHL Express logo
2. `fedex-logo.png` - FedEx logo  
3. `ups-logo.png` - UPS logo
4. `shipping-box.png` - Generic shipping box icon
5. `free-shipping.png` - Free shipping icon

## Where to Get Them

- **DHL:** https://www.dhl.com/en/home/press/media-center.html
- **FedEx:** https://www.fedex.com/en-us/about/policy/guidelines-for-using-the-fedex-brand.html
- **UPS:** https://www.ups.com/us/en/help-center/packaging-and-supplies/supplies-forms/brand-use.page
- **Generic Icons:** Use Lucide icons or create simple SVGs

## Temporary Fallback

If logos are missing, the UI will show:
- Broken image (but still functional)
- Provider name is always visible
- System continues to work

## Recommended Sizes

- Width: 120-150px
- Height: 40-50px
- Format: PNG with transparent background
- Resolution: 2x for retina displays

## Alternative: Use Icon Library

Instead of logo images, you can use Lucide icons:
- DHL: `<Plane />` or `<Package />`
- FedEx: `<Truck />` or `<Zap />`
- UPS: `<Box />` or `<Package />`

Update the settings page to use icons instead of images if preferred.
