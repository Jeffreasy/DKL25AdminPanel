export * from './cloudinary';
export { ImageUploadClient } from './imageUploadClient';
export { authManager } from './auth';

// RBAC
export { rbacClient } from './rbacClient';
export type {
  Role,
  Permission,
  UserPermission,
  UserRole,
  GroupedPermissionsResponse
} from './rbacClient';

// Resource Clients
export { underConstructionClient } from './underConstructionClient';
export { photoApiClient } from './photos';
export type { PhotoApiResponse, PhotoFilters, PhotoCreateData, PhotoUpdateData } from './photos';
export { sponsorClient } from './sponsorClient';
export { contactClient } from './contactClient';
export type { ContactMessage, ContactStats } from './contactClient';
export { videoClient } from './videoClient';
export type { Video, VideoCreateData, VideoUpdateData } from './videoClient';
export { albumClient } from './albumClient';
export type { Album, AlbumCreateData, AlbumUpdateData, AlbumPhoto } from './albumClient';
export { partnerClient } from './partnerClient';
export type { Partner, PartnerCreateData, PartnerUpdateData } from './partnerClient';

// Steps
export { stepsClient } from './stepsClient';
export type {
  Participant,
  RouteFund,
  ParticipantDashboard,
  TotalStepsResponse,
  FundsDistribution,
  UpdateStepsRequest,
  CreateRouteFundRequest,
  UpdateRouteFundRequest,
  DeleteRouteFundResponse,
  RouteOption,
  StepsStats
} from '../../features/steps/types';

// Notulen
export { notulenClient } from './notulenClient';
export type {
  Notulen,
  NotulenCreateRequest,
  NotulenUpdateRequest,
  NotulenVersion,
  AgendaItem,
  Besluit,
  Actiepunt,
  NotulenFilters,
  NotulenSearchParams,
  NotulenListResponse
} from '../../types/notulen';
