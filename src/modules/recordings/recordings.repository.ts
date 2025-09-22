
import { db } from '../../config/db/index.js'
import { recordingTable, streakTable, type Recording } from '../../config/db/schema/postgres.js'
import { JWTService } from '../../lib/middleware/jwt.js'
import type { BaseRepository } from '../../lib/repository.js'
import { eq } from 'drizzle-orm'

export interface RecordEntity extends Recording { }

export class RecordingsRepository implements BaseRepository<RecordEntity> {
    private recordings: RecordEntity[] = []

    async create(data: Partial<RecordEntity>): Promise<RecordEntity> {
        const inserted = await db
            .insert(recordingTable)
            .values(data as any)
            .returning()

        const record = await this.read(inserted[0].id)
        if (!record) {
            throw new Error('Failed to create recording')
        }

        this.recordings.push(record)
        return record
    }

    async update(id: number, data: Partial<RecordEntity>): Promise<RecordEntity> {
        await db
            .update(recordingTable)
            .set({ ...data, created_at: new Date().getTime() })
            .where(eq(recordingTable.id, id))

        const updated = await this.read(id)
        if (!updated) {
            throw new Error(`Recording with id ${id} not found`)
        }

        this.recordings = this.recordings.map(r => (r.id === id ? updated : r))
        return updated
    }

    async list(): Promise<RecordEntity[]> {
        const results = await db.select().from(recordingTable)
        this.recordings = results
        return results
    }

    async read(id: number): Promise<RecordEntity | null> {
        const result = await db
            .select()
            .from(recordingTable)
            .where(eq(recordingTable.id, id))

        return result.length > 0 ? result[0] : null
    }

    async delete(id: number): Promise<boolean> {
        try {
            await db.delete(recordingTable).where(eq(recordingTable.id, id))
            this.recordings = this.recordings.filter(r => r.id !== id)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async findByUserId(userId: number) {
        const streaks = await db
            .select()
            .from(streakTable)
            .where(
                eq(streakTable.user, userId)
            )
        return streaks.length > 0 ? streaks[0] : null
    }

    async findByToken(token: string) {
        const claims = JWTService.decode(token)
        if (claims && claims.sub) {
            return this.findByUserId(Number(claims.sub))
        }
        return null
    }
}

