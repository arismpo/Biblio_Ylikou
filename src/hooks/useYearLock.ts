// C:\Biblio_Ylikou_NEW\src\hooks\useYearLock.ts
import { useState, useEffect } from 'react'

export function useYearLock(year: number) {
    const [isLocked, setIsLocked] = useState(false)
    const [loading, setLoading] = useState(true)
    const [lockInfo, setLockInfo] = useState<{ lockedAt?: string; lockedBy?: string }>({})

    useEffect(() => {
        const checkLock = async () => {
            try {
                const res = await fetch(`/api/year-lock-status/${year}`)
                const data = await res.json()
                setIsLocked(data.locked || false)
                setLockInfo({
                    lockedAt: data.lockedAt,
                    lockedBy: data.lockedBy
                })
            } catch (error) {
                console.error('Error checking lock status:', error)
            } finally {
                setLoading(false)
            }
        }
        checkLock()
    }, [year])

    const refresh = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/year-lock-status/${year}`)
            const data = await res.json()
            setIsLocked(data.locked || false)
            setLockInfo({
                lockedAt: data.lockedAt,
                lockedBy: data.lockedBy
            })
        } catch (error) {
            console.error('Error checking lock status:', error)
        } finally {
            setLoading(false)
        }
    }

    return { isLocked, loading, lockInfo, refresh }
}