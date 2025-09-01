import { Palette, Truck, Zap, Shield, HeartHandshake, BarChart3 } from "lucide-react"

const services = [
  {
    icon: Palette,
    title: "Custom Design Services",
    description: "Professional design team creating unique products that sell. From concept to print-ready artwork."
  },
  {
    icon: Truck,
    title: "Global Fulfillment",
    description: "Fast, reliable shipping to customers worldwide. Multiple fulfillment centers for optimal delivery times."
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Automated order processing ensures your orders are in production within hours, not days."
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Premium materials and rigorous quality control. We stand behind every product we produce."
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Support",
    description: "24/7 customer service team ready to help. Personal account managers for high-volume sellers."
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Real-time dashboards and reporting to track your business growth and optimize performance."
  }
]

export function ServicesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <span className="text-sm font-medium">Complete POD Solution</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive services designed to help you scale your print-on-demand business effortlessly
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <div className="h-full bg-card rounded-xl p-6 border hover:border-primary/50 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}