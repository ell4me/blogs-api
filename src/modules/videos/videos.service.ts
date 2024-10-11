import { VideoCreateDto, VideoViewDto } from './videos.dto';

class VideosService {
	private videos: VideoViewDto[] = [];

	public getAllVideos(): VideoViewDto[] {
		return this.videos;
	}

	public createVideo(video: VideoCreateDto): VideoViewDto {
		const createdAtDate = new Date().toISOString();
		const createdVideo: VideoViewDto = {
			...video,
			id: new Date().getTime(),
			createdAt: createdAtDate,
			publicationDate: createdAtDate,
			minAgeRestriction: null,
			canBeDownloaded: false,
		};

		this.videos.push(createdVideo);

		return createdVideo;
	}

	public deleteAllVideos(): void {
		this.videos = [];
	}
}

const videosService = new VideosService();

export { videosService };
