export interface Site {
    id: string;
    slug: string;
    template_id: string;
    owner_user_id: string;
    draft_config: any; // Using 'any' for flexible JSON structure for now
    published_config: any | null;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
}

export interface CreateSiteParams {
    slug: string;
    templateId: string;
}

export interface UpdateDraftConfigParams {
    draft_config: any;
}

export interface PublishSiteParams {
    siteId: string;
}
