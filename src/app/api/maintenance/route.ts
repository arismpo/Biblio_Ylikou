// C:\Biblio_Ylikou_NEW\src\app\api\maintenance\route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSchemaName } from '@/utils/schemaManager'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, year } = body

        const results: any = {}

        switch (action) {
            case 'vacuum':
                results.vacuum = await runVacuum(year)
                break
            case 'analyze':
                results.analyze = await runAnalyze(year)
                break
            case 'reindex':
                results.reindex = await runReindex(year)
                break
            case 'full':
                results.vacuum = await runVacuum(year)
                results.analyze = await runAnalyze(year)
                results.reindex = await runReindex(year)
                break
            case 'stats':
                results.stats = await getDatabaseStats()
                break
            default:
                return NextResponse.json(
                    { error: 'Invalid action. Available: vacuum, analyze, reindex, full, stats' },
                    { status: 400 }
                )
        }

        return NextResponse.json({
            success: true,
            results
        })

    } catch (error) {
        console.error('Error running maintenance:', error)
        return NextResponse.json(
            { error: 'Failed to run maintenance: ' + (error as Error).message },
            { status: 500 }
        )
    }
}

// ===== VACUUM =====
async function runVacuum(year?: number) {
    try {
        console.log(`🧹 Running VACUUM for${year ? ` year ${year}` : ' all schemas'}`)

        if (year) {
            const schemaName = getSchemaName(year)
            await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Chapter"`)
            await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Onomastiko"`)
            await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Record"`)
            await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Entry"`)
            await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Attachment"`)
            await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."YearlyTotal"`)
        } else {
            // VACUUM all schemas
            const schemas = await prisma.$queryRawUnsafe(`
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name LIKE 'year_%'
            `) as any[]

            for (const schema of schemas) {
                const schemaName = schema.schema_name
                await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Chapter"`)
                await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Onomastiko"`)
                await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Record"`)
                await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Entry"`)
                await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."Attachment"`)
                await prisma.$executeRawUnsafe(`VACUUM ANALYZE ${schemaName}."YearlyTotal"`)
            }
        }

        console.log('✅ VACUUM completed')
        return { success: true, message: 'VACUUM completed successfully' }
    } catch (error) {
        console.error('Error running VACUUM:', error)
        return { success: false, error: (error as Error).message }
    }
}

// ===== ANALYZE =====
async function runAnalyze(year?: number) {
    try {
        console.log(`📊 Running ANALYZE for${year ? ` year ${year}` : ' all schemas'}`)

        if (year) {
            const schemaName = getSchemaName(year)
            await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Chapter"`)
            await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Onomastiko"`)
            await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Record"`)
            await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Entry"`)
            await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Attachment"`)
            await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."YearlyTotal"`)
        } else {
            const schemas = await prisma.$queryRawUnsafe(`
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name LIKE 'year_%'
            `) as any[]

            for (const schema of schemas) {
                const schemaName = schema.schema_name
                await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Chapter"`)
                await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Onomastiko"`)
                await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Record"`)
                await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Entry"`)
                await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."Attachment"`)
                await prisma.$executeRawUnsafe(`ANALYZE ${schemaName}."YearlyTotal"`)
            }
        }

        console.log('✅ ANALYZE completed')
        return { success: true, message: 'ANALYZE completed successfully' }
    } catch (error) {
        console.error('Error running ANALYZE:', error)
        return { success: false, error: (error as Error).message }
    }
}

// ===== REINDEX =====
async function runReindex(year?: number) {
    try {
        console.log(`🔄 Running REINDEX for${year ? ` year ${year}` : ' all schemas'}`)

        if (year) {
            const schemaName = getSchemaName(year)
            await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Chapter"`)
            await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Onomastiko"`)
            await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Record"`)
            await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Entry"`)
            await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Attachment"`)
            await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."YearlyTotal"`)
        } else {
            const schemas = await prisma.$queryRawUnsafe(`
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name LIKE 'year_%'
            `) as any[]

            for (const schema of schemas) {
                const schemaName = schema.schema_name
                await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Chapter"`)
                await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Onomastiko"`)
                await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Record"`)
                await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Entry"`)
                await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."Attachment"`)
                await prisma.$executeRawUnsafe(`REINDEX TABLE ${schemaName}."YearlyTotal"`)
            }
        }

        console.log('✅ REINDEX completed')
        return { success: true, message: 'REINDEX completed successfully' }
    } catch (error) {
        console.error('Error running REINDEX:', error)
        return { success: false, error: (error as Error).message }
    }
}

// ===== GET DATABASE STATS =====
async function getDatabaseStats() {
    try {
        console.log('📊 Getting database statistics')

        // Get database size
        const dbSize = await prisma.$queryRawUnsafe(`
            SELECT pg_database_size(current_database()) as size
        `) as any[]

        // Get table sizes by schema
        const tableSizes = await prisma.$queryRawUnsafe(`
            SELECT 
                table_schema,
                table_name,
                pg_total_relation_size(table_schema || '.' || table_name) as total_size,
                pg_table_size(table_schema || '.' || table_name) as table_size,
                pg_indexes_size(table_schema || '.' || table_name) as index_size
            FROM information_schema.tables
            WHERE table_schema LIKE 'year_%'
            ORDER BY total_size DESC
        `) as any[]

        // Get record counts by year
        const recordCounts = await prisma.$queryRawUnsafe(`
            SELECT 
                table_schema,
                (SELECT COUNT(*) FROM ${'year_2025'}."Record") as records_2025,
                (SELECT COUNT(*) FROM ${'year_2026'}."Record") as records_2026
            FROM information_schema.schemata
            WHERE schema_name LIKE 'year_%'
        `) as any[]

        // Get total attachments size
        const attachmentSize = await prisma.$queryRawUnsafe(`
            SELECT 
                table_schema,
                SUM(size) as total_attachment_size
            FROM information_schema.tables t
            JOIN ${'year_2025'}."Attachment" a ON true
            WHERE t.table_schema LIKE 'year_%'
            GROUP BY table_schema
        `) as any[]

        return {
            databaseSize: formatBytes(dbSize[0]?.size || 0),
            tableSizes: tableSizes.map((t: any) => ({
                schema: t.table_schema,
                table: t.table_name,
                total: formatBytes(t.total_size || 0),
                table: formatBytes(t.table_size || 0),
                indexes: formatBytes(t.index_size || 0)
            })),
            recordCounts,
            attachmentSizes: attachmentSize.map((a: any) => ({
                schema: a.table_schema,
                size: formatBytes(a.total_attachment_size || 0)
            }))
        }
    } catch (error) {
        console.error('Error getting stats:', error)
        return { error: (error as Error).message }
    }
}

// ===== HELPER: Format bytes =====
function formatBytes(bytes: number): string {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}