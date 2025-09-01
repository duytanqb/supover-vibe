import { Package, Users, Globe, TrendingUp } from "lucide-react"

const stats = [
  {
    icon: Package,
    value: "3M+",
    label: "Orders Shipped",
    description: "Successfully delivered worldwide"
  },
  {
    icon: Users,
    value: "50+",
    label: "Team Members",
    description: "Dedicated professionals"
  },
  {
    icon: Globe,
    value: "3+",
    label: "Countries",
    description: "Global market presence"
  },
  {
    icon: TrendingUp,
    value: "5+",
    label: "Years",
    description: "Industry experience"
  }
]

export function StatsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Proven Track Record
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Numbers that speak for our commitment to excellence and customer satisfaction
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-card rounded-2xl p-8 text-center border shadow-sm hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}