import { AVAILABLE_RESOLUTIONS } from './constants';

type AvailableResolutions = (typeof AVAILABLE_RESOLUTIONS)[number];

interface VideoViewDto {
	id: number;
	title: string;
	author: string;
	canBeDownloaded: boolean;
	minAgeRestriction: number | null;
	createdAt: string;
	publicationDate: string;
	availableResolutions: AvailableResolutions[];
}

interface VideoUpdateDto extends Omit<VideoViewDto, 'id' | 'createdAt'> {}

interface VideoCreateDto {
	title: string;
	author: string;
	availableResolutions: AvailableResolutions[];
}

export { VideoViewDto, VideoCreateDto, VideoUpdateDto };
