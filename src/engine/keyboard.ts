export class Keyboard {
    private static keys = new Set<string>();
    private static initialized = false;

    public static initialize() {
        if (this.initialized) return;

        window.addEventListener("keydown", (e) => this.keys.add(e.key.toLowerCase()));
        window.addEventListener("keyup", (e) => this.keys.delete(e.key.toLowerCase()));
        this.initialized = true;
    }

    public static isKeyDown(key: string): boolean {
        return this.keys.has(key.toLowerCase());
    }
}