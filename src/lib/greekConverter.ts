// C:\Biblio_Ylikou_NEW\src\lib\greekConverter.ts

/**
 * Μετατρέπει λατινικούς χαρακτήρες σε ελληνικούς (ΜΟΝΟ ΚΕΦΑΛΑΙΑ)
 * Π.χ. "A.A.A." -> "Α.Α.Α."
 */
export function convertLatinToGreek(text: string): string {
    if (!text) return text

    const latinToGreek: Record<string, string> = {
        'A': 'Α',
        'B': 'Β',
        'E': 'Ε',
        'Z': 'Ζ',
        'H': 'Η',
        'I': 'Ι',
        'K': 'Κ',
        'M': 'Μ',
        'N': 'Ν',
        'O': 'Ο',
        'T': 'Τ',
        'Y': 'Υ',
        'X': 'Ξ',
        'P': 'Π',
        'R': 'Ρ',
        'S': 'Σ',
        'F': 'Φ',
        'C': 'Ψ',
        'G': 'Γ',
        'L': 'Λ',
        'D': 'Δ',
        'W': 'Ω'
    }

    let result = ''
    for (const char of text) {
        if (char >= 'A' && char <= 'Z') {
            result += latinToGreek[char] || char
        } else {
            result += char
        }
    }
    return result
}

/**
 * Μετατρέπει ελληνικούς χαρακτήρες σε λατινικούς (ΜΟΝΟ ΚΕΦΑΛΑΙΑ)
 * Π.χ. "Α.Α.Α." -> "A.A.A."
 */
export function convertGreekToLatin(text: string): string {
    if (!text) return text

    const greekToLatin: Record<string, string> = {
        'Α': 'A',
        'Β': 'B',
        'Ε': 'E',
        'Ζ': 'Z',
        'Η': 'H',
        'Ι': 'I',
        'Κ': 'K',
        'Μ': 'M',
        'Ν': 'N',
        'Ο': 'O',
        'Τ': 'T',
        'Υ': 'Y',
        'Ξ': 'X',
        'Π': 'P',
        'Ρ': 'R',
        'Σ': 'S',
        'Φ': 'F',
        'Ψ': 'C',
        'Γ': 'G',
        'Λ': 'L',
        'Δ': 'D',
        'Ω': 'W'
    }

    let result = ''
    for (const char of text) {
        result += greekToLatin[char] || char
    }
    return result
}

/**
 * 🔥 UPPERCASE για logs
 */
export function toUpperCaseForLog(text: string): string {
    return text ? text.toUpperCase() : ''
}

/**
 * Κανονικοποιεί ένα όνομα κεφαλαίου για σύγκριση
 */
export function normalizeChapterName(name: string): string {
    if (!name) return name

    // Δοκιμάζει και τις δύο μετατροπές
    const latinToGreekVersion = convertLatinToGreek(name)
    const greekToLatinVersion = convertGreekToLatin(name)

    // Αφαιρεί τελείες και κενά και από τις δύο εκδόσεις
    const normalized1 = latinToGreekVersion.replace(/\./g, '').replace(/\s/g, '')
    const normalized2 = greekToLatinVersion.replace(/\./g, '').replace(/\s/g, '')

    // Επιστρέφει την ελληνική εκδοχή (θα συγκρίνουμε και τις δύο)
    return normalized1
}

/**
 * Συγκρίνει δύο ονόματα κεφαλαίων
 */
export function compareChapterNames(name1: string, name2: string): boolean {
    const n1 = normalizeChapterName(name1)
    const n2 = normalizeChapterName(name2)

    if (n1 === n2) return true

    const latin1 = convertGreekToLatin(name1).replace(/\./g, '').replace(/\s/g, '')
    const latin2 = convertGreekToLatin(name2).replace(/\./g, '').replace(/\s/g, '')

    return latin1 === latin2
}