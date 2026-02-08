import { Code, PenTool, Megaphone, Pen, Briefcase, Truck, UtensilsCrossed, GraduationCap, Sparkles, Wrench, Camera, Car, Home, Scissors, Package, Video } from 'lucide-react'

export const CategoryIcon = ({ category, className = "h-6 w-6" }) => {
    switch (category) {
        case 'Tech': return <Code className={className} />
        case 'Development': return <Code className={className} /> // Legacy support
        case 'Design': return <PenTool className={className} />
        case 'Cleaning': return <Sparkles className={className} />
        case 'Delivery': return <Truck className={className} />
        case 'Cooking': return <UtensilsCrossed className={className} />
        case 'Tutoring': return <GraduationCap className={className} />
        case 'Beauty': return <Scissors className={className} />
        case 'Repair': return <Wrench className={className} />
        case 'Photography': return <Camera className={className} />
        case 'Driving': return <Car className={className} />
        case 'Moving': return <Package className={className} />
        case 'HomeService': return <Home className={className} />
        case 'Writing': return <Pen className={className} />
        case 'Marketing': return <Megaphone className={className} />
        case 'Video': return <Video className={className} />
        default: return <Briefcase className={className} />
    }
}
