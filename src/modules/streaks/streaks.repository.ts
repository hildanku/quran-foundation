import { eq } from 'drizzle-orm'
import { streakTable, type Streak } from '@/config/db/schema/postgres.js'
import type { BaseRepository } from '@/lib/repository.js'
import { db } from '@/config/db/index.js'

export interface StreakEntity extends Streak { }

export class StreaksRepository implements BaseRepository<StreakEntity> {
    private streaks: StreakEntity[] = []

    async create(data: Partial<StreakEntity>): Promise<StreakEntity> {
        const inserted = await db
            .insert(streakTable)
            .values(data as any)
            .returning()

        const streak = await this.read(inserted[0].id)
        if (!streak) throw new Error('Failed to create streak')

        this.streaks.push(streak)

        return streak
    }

    async update(id: number, data: Partial<StreakEntity>): Promise<StreakEntity> {
        await db
            .update(streakTable)
            .set(data as any)
            .where(eq(streakTable.id, id))

        const updated = await this.read(id)
        if (!updated) throw new Error(`Streak with id ${id} not found`)

        this.streaks = this.streaks.map(s => (s.id === id ? updated : s))

        return updated
    }

    async list(): Promise<StreakEntity[]> {
        const results = await db
            .select()
            .from(streakTable)
        this.streaks = results
        return results
    }

    async read(id: number): Promise<StreakEntity | null> {
        const result = await db.select().from(streakTable).where(eq(streakTable.id, id))
        return result.length > 0 ? result[0] : null
    }

    async delete(id: number): Promise<boolean> {
        try {
            await db.delete(streakTable).where(eq(streakTable.id, id))
            this.streaks = this.streaks.filter(s => s.id !== id)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async findByUser(userId: number): Promise<StreakEntity | null> {
        const result = await db.select().from(streakTable).where(eq(streakTable.user, userId))
        return result.length > 0 ? result[0] : null
    }
}
