interface PageHeaderProps {
  activeTab: "builder" | "analyzer"
}

export default function PageHeader({ activeTab }: PageHeaderProps) {
  return (
    <div className="relative min-h-[120px]">
      <div className={`absolute top-0 left-0 right-0 transition-opacity duration-200 ${activeTab === "builder" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <h1 className="font-montserrat font-black text-4xl mb-2">Routine Generator</h1>
        <p className="text-muted-foreground">Generate a personalized day and night skincare routine based on your skin concerns, allergies, and budget.</p>
      </div>
      <div className={`absolute top-0 left-0 right-0 transition-opacity duration-200 ${activeTab === "analyzer" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <h1 className="font-montserrat font-black text-4xl mb-2">Routine Analyzer</h1>
        <p className="text-muted-foreground">Analyze your current skincare routine for compatibility and effectiveness. Detect conflicts, ingredient incompatibilities, and get personalized recommendations.</p>
      </div>
    </div>
  )
}
