import { availableResolutions } from './constants';

type AvailableResolutions = (typeof availableResolutions)[number];

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

interface VideoCreateDto {
	title: string;
	author: string;
	availableResolutions: AvailableResolutions[];
}

export { VideoViewDto, VideoCreateDto };
