// C:\Biblio_Ylikou_NEW\scripts\initYear.ts
import { initializeYear } from '../utils/schemaManager'

// Λήψη έτους από command line argument ή χρήση 2025 ως default
const args = process.argv.slice(2)
const year = args[0] ? parseInt(args[0]) : 2025

console.log(`🚀 Initializing year ${year}...`)

initializeYear(year)
    .then(() => {
        console.log(`✅ Year ${year} initialized successfully!`)
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Error initializing year:', error)
        process.exit(1)
    })