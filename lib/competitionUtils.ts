export function isRegistrationOpen(comp: any): boolean {
    if (!comp) return false;
    
    // If either start date or end date is defined, use date-based logic
    if (comp.registerStartDate || comp.registerEndDate) {
        const now = new Date();
        const start = comp.registerStartDate ? new Date(comp.registerStartDate) : new Date(0); // Beginning of time
        const end = comp.registerEndDate ? new Date(comp.registerEndDate) : new Date(32503680000000); // Year 3000
        
        return now >= start && now <= end;
    }
    
    // Fallback to manual toggle if no dates are set
    return comp.registerOpen === true || String(comp.registerOpen).toUpperCase() === 'TRUE';
}
