import { VideoCreateDto, VideoUpdateDto, VideoViewDto } from './videos.dto';

class VideosService {
	private videos: VideoViewDto[] = [];

	public getAllVideos(): VideoViewDto[] {
		return this.videos;
	}

	public getVideoById(id: number): VideoViewDto | void {
		return this.videos.find(video => video.id === id);
	}

	public updateVideoById(id: number, newVideo: VideoUpdateDto): void {
		this.videos = this.videos.map(video => {
			if (video.id === id) {
				return { ...video, ...newVideo };
			}

			return video;
		});

		return;
	}

	public createVideo({ title, author, availableResolutions }: VideoCreateDto): VideoViewDto {
		const createdAtDate = new Date().toISOString();
		const createdVideo: VideoViewDto = {
			id: new Date().getTime(),
			title,
			author,
			availableResolutions,
			createdAt: createdAtDate,
			publicationDate: createdAtDate,
			minAgeRestriction: null,
			canBeDownloaded: false,
		};

		this.videos.push(createdVideo);

		return createdVideo;
	}

	public deleteVideoById(id: number): boolean {
		const currentVideoIndex = this.videos.findIndex(video => video.id === id);
		if (currentVideoIndex === -1) {
			return false;
		}

		this.videos.splice(currentVideoIndex, 1);

		return true;
	}

	public deleteAllVideos(): void {
		this.videos = [];
	}
}

const videosService = new VideosService();

export { videosService };
