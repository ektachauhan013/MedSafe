/**
 * scanner.js
 * Core logic for detecting interactions and contraindications.
 */

const Scanner = {
    // Helper to find a medicine object by name (case-insensitive)
    findMedicine: (name) => {
        if (!name) return null;
        const normalized = name.toLowerCase().trim();
        return window.DB.MEDICINES.find(m => m.name.toLowerCase() === normalized);
    },

    // Main Scan Function
    scan: (med1Name, med2Name, profile) => {
        const results = {
            riskLevel: 'Safe', // Safe, Caution, Unsafe
            interactions: [],
            contraindications: [],
            summary: ''
        };

        const med1 = Scanner.findMedicine(med1Name);
        const med2 = Scanner.findMedicine(med2Name);

        // 1. Check if medicines exist in our mock DB
        if (!med1) {
            results.interactions.push({ type: 'unknown', description: `Medicine "${med1Name}" not found in database. Effectiveness unknown.` });
        }
        if (!med2) {
            results.interactions.push({ type: 'unknown', description: `Medicine "${med2Name}" not found in database. Effectiveness unknown.` });
        }

        // If both medicines are known, check interactions
        if (med1 && med2) {
            // A. Check Direct Database Interactions
            const interaction = window.DB.INTERACTIONS.find(i =>
                (i.meds.includes(med1.name) && i.meds.includes(med2.name)) ||
                (i.meds.includes(med1.category) && i.meds.includes(med2.category)) // Simple category check
            );

            if (interaction) {
                results.interactions.push(interaction);

                // Set Risk Level
                if (interaction.type === 'severe') results.riskLevel = 'Unsafe';
                else if (interaction.type === 'moderate' && results.riskLevel !== 'Unsafe') results.riskLevel = 'Caution';
            }

            // B. Check Duplicate Active Ingredients (Overdose Risk)
            if (med1.activeIngredient === med2.activeIngredient) {
                results.interactions.push({
                    risk: 'High',
                    type: 'severe',
                    description: `Duplicate active ingredient: ${med1.activeIngredient}.`,
                    recommendation: 'Do NOT take together. High risk of overdose.'
                });
                results.riskLevel = 'Unsafe';
            }
        }

        // 2. Check Profile Contraindications (if profile exists)
        if (profile) {
            [med1, med2].forEach(med => {
                if (!med) return;

                // A. Pregnancy Check
                if (profile.pregnant === 'true' || profile.pregnant === true) { // check both string/bool from form
                    const warning = window.DB.CONTRAINDICATIONS.pregnant[med.category] || window.DB.CONTRAINDICATIONS.pregnant[med.name];
                    if (warning) {
                        results.contraindications.push({
                            med: med.name,
                            reason: 'Pregnancy',
                            warning: warning
                        });
                        results.riskLevel = results.riskLevel === 'Safe' ? 'Caution' : results.riskLevel;
                        if (warning.includes('Unsafe')) results.riskLevel = 'Unsafe';
                    }
                }

                // B. Stomach Sensitivity
                if (profile.stomach === 'true' || profile.stomach === true) {
                    const warning = window.DB.CONTRAINDICATIONS.stomach_sensitive[med.category];
                    if (warning) {
                        results.contraindications.push({
                            med: med.name,
                            reason: 'Sensitive Stomach',
                            warning: warning
                        });
                        results.riskLevel = results.riskLevel === 'Safe' ? 'Caution' : results.riskLevel;
                    }
                }

                // C. Allergies
                // Simple string match against profile.allergies
                if (profile.allergies && profile.allergies.length > 0) {
                    const allergyList = profile.allergies.toLowerCase();
                    if (allergyList.includes(med.name.toLowerCase()) || allergyList.includes(med.activeIngredient.toLowerCase())) {
                        results.contraindications.push({
                            med: med.name,
                            reason: 'Allergy',
                            warning: `You have listed an allergy that matches this medicine (${med.name}).`
                        });
                        results.riskLevel = 'Unsafe';
                    }
                }
            });
        }

        return results;
    }
};

window.Scanner = Scanner;
