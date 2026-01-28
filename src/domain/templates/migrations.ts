import { TemplateConfig } from './contracts';

type MigrationFn = (config: any) => any;

const migrations: Record<string, Record<string, MigrationFn>> = {
    // Example: '0.1.0': { '0.2.0': (config) => ({ ...config, newField: 'default' }) }
};

export function migrateTemplateConfig(
    fromVersion: string,
    toVersion: string,
    config: TemplateConfig
): TemplateConfig {
    if (fromVersion === toVersion) return config;

    // Simplified logic for horizontal migrations
    const migrationPath = migrations[fromVersion]?.[toVersion];

    if (migrationPath) {
        return migrationPath(config);
    }

    console.warn(`No migration found from ${fromVersion} to ${toVersion}`);
    return config;
}
