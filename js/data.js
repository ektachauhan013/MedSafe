/**
 * Mock Data for Medicine Interaction Scanner
 * NOTE: This is for educational/demo purposes only.
 */

// List of supported medicines
const MEDICINES = [
    { id: 'm1', name: 'Paracetamol', category: 'Painkiller', activeIngredient: 'Paracetamol' },
    { id: 'm2', name: 'Ibuprofen', category: 'NSAID', activeIngredient: 'Ibuprofen' },
    { id: 'm3', name: 'Aspirin', category: 'NSAID', activeIngredient: 'Aspirin' },
    { id: 'm4', name: 'Amoxicillin', category: 'Antibiotic', activeIngredient: 'Amoxicillin' },
    { id: 'm5', name: 'Warfarin', category: 'Blood Thinner', activeIngredient: 'Warfarin' },
    { id: 'm6', name: 'Cetirizine', category: 'Antihistamine', activeIngredient: 'Cetirizine' },
    { id: 'm7', name: 'Codeine', category: 'Opioid', activeIngredient: 'Codeine' },
    { id: 'm8', name: 'Diazepam', category: 'Benzodiazepine', activeIngredient: 'Diazepam' }
];

// Interaction Rules
// Type: 'severe' | 'moderate' | 'mild'
const INTERACTIONS = [
    {
        meds: ['Ibuprofen', 'Aspirin'],
        risk: 'High',
        type: 'severe',
        description: 'Both are NSAIDs. Taking them together increases the risk of stomach ulcers and bleeding.',
        recommendation: 'Avoid taking together. Consult a doctor.'
    },
    {
        meds: ['Warfarin', 'Aspirin'],
        risk: 'High',
        type: 'severe',
        description: 'Significantly increases the risk of bleeding.',
        recommendation: 'Do NOT take together unless prescribed by a specialist.'
    },
    {
        meds: ['Warfarin', 'Ibuprofen'],
        risk: 'High',
        type: 'severe',
        description: 'Increases risk of stomach bleeding.',
        recommendation: 'Avoid NSAIDs while on Warfarin. Use Paracetamol instead.'
    },
    {
        meds: ['Paracetamol', 'Codeine'],
        risk: 'Moderate',
        type: 'moderate',
        description: 'Commonly prescribed together (e.g., Co-codamol), but be careful not to double dose if taking other Paracetamol products.',
        recommendation: 'Safe if total Paracetamol does not exceed 4g/day.'
    },
    {
        meds: ['Diazepam', 'Codeine'],
        risk: 'High',
        type: 'severe',
        description: 'Both cause drowsiness and respiratory depression.',
        recommendation: 'Avoid combining as it can lead to extreme sedation or breathing difficulties.'
    },
    {
        meds: ['Alcohol', 'Metronidazole'], // Special case handled in logic if we added alcohol as a "med", but here just demonstrating
        risk: 'High',
        type: 'severe',
        description: 'Causes severe reaction (disulfiram-like) with vomiting and flushing.',
        recommendation: 'Do not drink alcohol.'
    }
];

// Profile-based Contraindications
const CONTRAINDICATIONS = {
    'pregnant': {
        'NSAID': 'Not recommended during pregnancy (especially 3rd trimester).',
        'Warfarin': 'Unsafe during pregnancy.',
        'Codeine': 'Use only if strictly necessary; risk of neonatal withdrawal.'
    },
    'stomach_sensitive': {
        'NSAID': 'May irritate stomach lining. Take with food.'
    },
    'liver_issues': { // If we added this condition
        'Paracetamol': 'Limit dose. High risk of liver strain.'
    }
    // Allergies are handled dynamically by string matching in scanner.js
};

// Export for use in other files (simulated via global scope since no modules)
window.DB = {
    MEDICINES,
    INTERACTIONS,
    CONTRAINDICATIONS
};
