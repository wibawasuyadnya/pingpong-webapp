// lib/api.ts
import { Video } from '@/types/type';
import { User } from '@/types/type';
import { apiUrl } from '@/utils/envConfig';
import getHeader from './getHeader';

interface ApiResponse {
    data: Video[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: {
        next: string | null;
    };
}

export async function fetchVideos(
    page: number = 1,
    limit: number = 10,
    user: User | null
): Promise<Video[]> {
    const headers = await getHeader({
        user,
    });

    const response = await fetch(`${apiUrl}/api/video?page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to fetch videos');
    }

    const data: ApiResponse = await response.json();
    return data.data;
}