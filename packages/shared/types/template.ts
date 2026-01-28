import { z } from 'zod';
import {
    ThemeConfigSchema,
    SectionsConfigSchema,
    TemplateConfigSchema,
    TemplateDefinitionSchema,
} from '../schemas/template';

export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
export type SectionsConfig = z.infer<typeof SectionsConfigSchema>;
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
export type TemplateDefinition = z.infer<typeof TemplateDefinitionSchema>;
