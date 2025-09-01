import Image from "next/image"

const platforms = [
  {
    name: "TikTok Shop",
    description: "Seamless integration with TikTok's e-commerce platform",
    color: "from-pink-500 to-purple-500"
  },
  {
    name: "Amazon",
    description: "FBA and FBM fulfillment for Amazon sellers",
    color: "from-orange-500 to-yellow-500"
  },
  {
    name: "Google Shopping",
    description: "Optimized for Google Merchant Center",
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Pinterest",
    description: "Perfect for Pinterest Shopping features",
    color: "from-red-500 to-pink-500"
  }
]

export function PlatformsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sell Everywhere Your Customers Shop
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multi-channel integration to maximize your reach and sales potential
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platforms.map((platform, index) => (
            <div 
              key={index}
              className="relative group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${platform.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative bg-card rounded-xl p-6 border hover:border-primary/30 transition-all hover:shadow-lg">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${platform.color} mb-4`}>
                  <span className="text-2xl font-bold text-white">
                    {platform.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{platform.name}</h3>
                <p className="text-sm text-muted-foreground">{platform.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Plus integrations with Shopify, WooCommerce, Etsy, and more!
          </p>
          <button className="text-primary hover:text-primary/80 font-medium">
            View All Integrations →
          </button>
        </div>
      </div>
    </section>
  )
}