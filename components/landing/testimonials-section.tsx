import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "E-commerce Entrepreneur",
    content: "Dragon Media has been instrumental in scaling my POD business. Their quality and turnaround time are unmatched!",
    rating: 5,
    platform: "TikTok Seller"
  },
  {
    name: "Michael Chen",
    role: "Brand Owner",
    content: "The integration with multiple platforms saved us countless hours. Outstanding service and support team.",
    rating: 5,
    platform: "Amazon FBA"
  },
  {
    name: "Emma Williams",
    role: "Digital Marketer",
    content: "From 100 to 10,000 orders per month - Dragon Media handled our growth seamlessly. Highly recommended!",
    rating: 5,
    platform: "Multi-Channel"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Thousands of Sellers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our partners say about working with Dragon Media
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative"
            >
              <div className="bg-card rounded-xl p-6 border hover:shadow-lg transition-shadow h-full flex flex-col">
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 flex-grow">
                  "{testimonial.content}"
                </p>
                
                <div className="pt-4 border-t">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary mt-1">{testimonial.platform}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}