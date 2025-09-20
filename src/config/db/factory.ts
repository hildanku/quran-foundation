export type FactorySchema<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
export abstract class BaseFactory<T> {
    protected abstract init(): T
    protected abstract insert(entity: T): Promise<T | null>
    protected abstract name: string

    protected info(status: 'start' | 'finish') {
        console.log(`${status} seeding ${this.name}`)
    }

    protected batch(count: number): T[] {
        return Array.from({ length: count }, () => this.init())
    }

    public async create(count: number = 1): Promise<(T | null)[]> {
        this.info('start')
        const created = this.batch(count)
        const res = await Promise.all(created.map((model) => this.insert(model)))
        this.info('finish')
        return res
    }
}
