// src/services/github.service.ts
import fetch from 'node-fetch';

interface CreateIssueParams {
    title: string;
    body: string;
    labels?: string[];
}

export class GitHubService {
    private token: string | undefined;
    private owner: string | undefined;
    private repo: string | undefined;

    constructor() {
        this.token = process.env.GITHUB_TOKEN;
        this.owner = process.env.GITHUB_REPO_OWNER;
        this.repo = process.env.GITHUB_REPO_NAME;

        if (!this.token || !this.owner || !this.repo) {
            console.warn(
                '[GitHubService] Faltan variables de entorno GITHUB_TOKEN, GITHUB_REPO_OWNER o GITHUB_REPO_NAME. No se crearán issues.'
            );
        }
    }

    private isConfigured() {
        return !!(this.token && this.owner && this.repo);
    }

    async createIssue({ title, body, labels }: CreateIssueParams): Promise<void> {
        if (!this.isConfigured()) {
            console.warn('[GitHubService] Configuración incompleta. Issue NO enviada.');
            return;
        }

        try {
            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/issues`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        body,
                        labels
                    })
                }
            );

            if (!response.ok) {
                const text = await response.text();
                console.error('[GitHubService] Error creando issue en GitHub:', response.status, text);
            } else {
                const data: any = await response.json();
                console.log('[GitHubService] Issue creada en GitHub:', data.html_url);

            }
        } catch (error) {
            console.error('[GitHubService] Error de red al crear issue:', error);
        }
    }
}
