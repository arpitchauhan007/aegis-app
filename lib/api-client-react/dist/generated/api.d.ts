import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityItem, CheckIn, CheckInInput, Dashboard, EmergencyAlert, EmergencyAlertInput, FamilyMember, FamilyMemberInput, HealthItem, HealthItemInput, HealthStatus, HelpRequest, HelpRequestInput, Notification, Permission, PermissionUpdate, Profile, ProfileUpdate, ServiceInput, ServiceRequest } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardUrl: () => string;
/**
 * @summary Get the Today overview
 */
export declare const getDashboard: (options?: Parameters<typeof customFetch>[1]) => Promise<Dashboard>;
export declare const getGetDashboardQueryKey: () => readonly ["/api/dashboard"];
export declare const getGetDashboardQueryOptions: <TData = Awaited<ReturnType<typeof getDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;
export type GetDashboardQueryError = ErrorType<unknown>;
/**
 * @summary Get the Today overview
 */
export declare function useGetDashboard<TData = Awaited<ReturnType<typeof getDashboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetActivityUrl: () => string;
/**
 * @summary Get recent activity
 */
export declare const getActivity: (options?: Parameters<typeof customFetch>[1]) => Promise<ActivityItem[]>;
export declare const getGetActivityQueryKey: () => readonly ["/api/activity"];
export declare const getGetActivityQueryOptions: <TData = Awaited<ReturnType<typeof getActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getActivity>>>;
export type GetActivityQueryError = ErrorType<unknown>;
/**
 * @summary Get recent activity
 */
export declare function useGetActivity<TData = Awaited<ReturnType<typeof getActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCheckInUrl: () => string;
/**
 * @summary Record a check-in
 */
export declare const createCheckIn: (checkInInput: CheckInInput, options?: Parameters<typeof customFetch>[1]) => Promise<CheckIn>;
export declare const getCreateCheckInMutationKey: () => readonly ["createCheckIn"];
export declare const getCreateCheckInMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCheckIn>>, TError, CreateCheckInMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCheckIn>>, TError, CreateCheckInMutationVariables, TContext>;
export type CreateCheckInMutationResult = NonNullable<Awaited<ReturnType<typeof createCheckIn>>>;
export type CreateCheckInMutationBody = BodyType<CheckInInput>;
export type CreateCheckInMutationError = ErrorType<unknown>;
export type CreateCheckInMutationVariables = {
    data: BodyType<CheckInInput>;
};
/**
* @summary Record a check-in
*/
export declare const useCreateCheckIn: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCheckIn>>, TError, CreateCheckInMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCheckIn>>, TError, CreateCheckInMutationVariables, TContext>;
export declare const getGetFamilyUrl: () => string;
/**
 * @summary List trusted family members
 */
export declare const getFamily: (options?: Parameters<typeof customFetch>[1]) => Promise<FamilyMember[]>;
export declare const getGetFamilyQueryKey: () => readonly ["/api/family"];
export declare const getGetFamilyQueryOptions: <TData = Awaited<ReturnType<typeof getFamily>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFamily>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFamily>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFamilyQueryResult = NonNullable<Awaited<ReturnType<typeof getFamily>>>;
export type GetFamilyQueryError = ErrorType<unknown>;
/**
 * @summary List trusted family members
 */
export declare function useGetFamily<TData = Awaited<ReturnType<typeof getFamily>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFamily>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateFamilyMemberUrl: () => string;
/**
 * @summary Add a trusted family member
 */
export declare const createFamilyMember: (familyMemberInput: FamilyMemberInput, options?: Parameters<typeof customFetch>[1]) => Promise<FamilyMember>;
export declare const getCreateFamilyMemberMutationKey: () => readonly ["createFamilyMember"];
export declare const getCreateFamilyMemberMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFamilyMember>>, TError, CreateFamilyMemberMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createFamilyMember>>, TError, CreateFamilyMemberMutationVariables, TContext>;
export type CreateFamilyMemberMutationResult = NonNullable<Awaited<ReturnType<typeof createFamilyMember>>>;
export type CreateFamilyMemberMutationBody = BodyType<FamilyMemberInput>;
export type CreateFamilyMemberMutationError = ErrorType<unknown>;
export type CreateFamilyMemberMutationVariables = {
    data: BodyType<FamilyMemberInput>;
};
/**
* @summary Add a trusted family member
*/
export declare const useCreateFamilyMember: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createFamilyMember>>, TError, CreateFamilyMemberMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createFamilyMember>>, TError, CreateFamilyMemberMutationVariables, TContext>;
export declare const getGetHelpRequestsUrl: () => string;
/**
 * @summary List help requests
 */
export declare const getHelpRequests: (options?: Parameters<typeof customFetch>[1]) => Promise<HelpRequest[]>;
export declare const getGetHelpRequestsQueryKey: () => readonly ["/api/help-requests"];
export declare const getGetHelpRequestsQueryOptions: <TData = Awaited<ReturnType<typeof getHelpRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHelpRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHelpRequests>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHelpRequestsQueryResult = NonNullable<Awaited<ReturnType<typeof getHelpRequests>>>;
export type GetHelpRequestsQueryError = ErrorType<unknown>;
/**
 * @summary List help requests
 */
export declare function useGetHelpRequests<TData = Awaited<ReturnType<typeof getHelpRequests>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHelpRequests>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateHelpRequestUrl: () => string;
/**
 * @summary Request help
 */
export declare const createHelpRequest: (helpRequestInput: HelpRequestInput, options?: Parameters<typeof customFetch>[1]) => Promise<HelpRequest>;
export declare const getCreateHelpRequestMutationKey: () => readonly ["createHelpRequest"];
export declare const getCreateHelpRequestMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHelpRequest>>, TError, CreateHelpRequestMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createHelpRequest>>, TError, CreateHelpRequestMutationVariables, TContext>;
export type CreateHelpRequestMutationResult = NonNullable<Awaited<ReturnType<typeof createHelpRequest>>>;
export type CreateHelpRequestMutationBody = BodyType<HelpRequestInput>;
export type CreateHelpRequestMutationError = ErrorType<unknown>;
export type CreateHelpRequestMutationVariables = {
    data: BodyType<HelpRequestInput>;
};
/**
* @summary Request help
*/
export declare const useCreateHelpRequest: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHelpRequest>>, TError, CreateHelpRequestMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createHelpRequest>>, TError, CreateHelpRequestMutationVariables, TContext>;
export declare const getGetServicesUrl: () => string;
/**
 * @summary List service requests
 */
export declare const getServices: (options?: Parameters<typeof customFetch>[1]) => Promise<ServiceRequest[]>;
export declare const getGetServicesQueryKey: () => readonly ["/api/services"];
export declare const getGetServicesQueryOptions: <TData = Awaited<ReturnType<typeof getServices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getServices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetServicesQueryResult = NonNullable<Awaited<ReturnType<typeof getServices>>>;
export type GetServicesQueryError = ErrorType<unknown>;
/**
 * @summary List service requests
 */
export declare function useGetServices<TData = Awaited<ReturnType<typeof getServices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateServiceUrl: () => string;
/**
 * @summary Request a service
 */
export declare const createService: (serviceInput: ServiceInput, options?: Parameters<typeof customFetch>[1]) => Promise<ServiceRequest>;
export declare const getCreateServiceMutationKey: () => readonly ["createService"];
export declare const getCreateServiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, CreateServiceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, CreateServiceMutationVariables, TContext>;
export type CreateServiceMutationResult = NonNullable<Awaited<ReturnType<typeof createService>>>;
export type CreateServiceMutationBody = BodyType<ServiceInput>;
export type CreateServiceMutationError = ErrorType<unknown>;
export type CreateServiceMutationVariables = {
    data: BodyType<ServiceInput>;
};
/**
* @summary Request a service
*/
export declare const useCreateService: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createService>>, TError, CreateServiceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createService>>, TError, CreateServiceMutationVariables, TContext>;
export declare const getGetHealthItemsUrl: () => string;
/**
 * @summary List health reminders
 */
export declare const getHealthItems: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthItem[]>;
export declare const getGetHealthItemsQueryKey: () => readonly ["/api/health-items"];
export declare const getGetHealthItemsQueryOptions: <TData = Awaited<ReturnType<typeof getHealthItems>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHealthItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHealthItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHealthItemsQueryResult = NonNullable<Awaited<ReturnType<typeof getHealthItems>>>;
export type GetHealthItemsQueryError = ErrorType<unknown>;
/**
 * @summary List health reminders
 */
export declare function useGetHealthItems<TData = Awaited<ReturnType<typeof getHealthItems>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHealthItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateHealthItemUrl: () => string;
/**
 * @summary Add a health reminder
 */
export declare const createHealthItem: (healthItemInput: HealthItemInput, options?: Parameters<typeof customFetch>[1]) => Promise<HealthItem>;
export declare const getCreateHealthItemMutationKey: () => readonly ["createHealthItem"];
export declare const getCreateHealthItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHealthItem>>, TError, CreateHealthItemMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createHealthItem>>, TError, CreateHealthItemMutationVariables, TContext>;
export type CreateHealthItemMutationResult = NonNullable<Awaited<ReturnType<typeof createHealthItem>>>;
export type CreateHealthItemMutationBody = BodyType<HealthItemInput>;
export type CreateHealthItemMutationError = ErrorType<unknown>;
export type CreateHealthItemMutationVariables = {
    data: BodyType<HealthItemInput>;
};
/**
* @summary Add a health reminder
*/
export declare const useCreateHealthItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createHealthItem>>, TError, CreateHealthItemMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createHealthItem>>, TError, CreateHealthItemMutationVariables, TContext>;
export declare const getCreateEmergencyAlertUrl: () => string;
/**
 * @summary Notify selected emergency contacts
 */
export declare const createEmergencyAlert: (emergencyAlertInput: EmergencyAlertInput, options?: Parameters<typeof customFetch>[1]) => Promise<EmergencyAlert>;
export declare const getCreateEmergencyAlertMutationKey: () => readonly ["createEmergencyAlert"];
export declare const getCreateEmergencyAlertMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmergencyAlert>>, TError, CreateEmergencyAlertMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEmergencyAlert>>, TError, CreateEmergencyAlertMutationVariables, TContext>;
export type CreateEmergencyAlertMutationResult = NonNullable<Awaited<ReturnType<typeof createEmergencyAlert>>>;
export type CreateEmergencyAlertMutationBody = BodyType<EmergencyAlertInput>;
export type CreateEmergencyAlertMutationError = ErrorType<unknown>;
export type CreateEmergencyAlertMutationVariables = {
    data: BodyType<EmergencyAlertInput>;
};
/**
* @summary Notify selected emergency contacts
*/
export declare const useCreateEmergencyAlert: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmergencyAlert>>, TError, CreateEmergencyAlertMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEmergencyAlert>>, TError, CreateEmergencyAlertMutationVariables, TContext>;
export declare const getGetNotificationsUrl: () => string;
/**
 * @summary List notifications
 */
export declare const getNotifications: (options?: Parameters<typeof customFetch>[1]) => Promise<Notification[]>;
export declare const getGetNotificationsQueryKey: () => readonly ["/api/notifications"];
export declare const getGetNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof getNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof getNotifications>>>;
export type GetNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List notifications
 */
export declare function useGetNotifications<TData = Awaited<ReturnType<typeof getNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPermissionsUrl: () => string;
/**
 * @summary List privacy permissions
 */
export declare const getPermissions: (options?: Parameters<typeof customFetch>[1]) => Promise<Permission[]>;
export declare const getGetPermissionsQueryKey: () => readonly ["/api/permissions"];
export declare const getGetPermissionsQueryOptions: <TData = Awaited<ReturnType<typeof getPermissions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPermissions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPermissions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPermissionsQueryResult = NonNullable<Awaited<ReturnType<typeof getPermissions>>>;
export type GetPermissionsQueryError = ErrorType<unknown>;
/**
 * @summary List privacy permissions
 */
export declare function useGetPermissions<TData = Awaited<ReturnType<typeof getPermissions>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPermissions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdatePermissionUrl: (id: number) => string;
/**
 * @summary Update a privacy permission
 */
export declare const updatePermission: (id: number, permissionUpdate: PermissionUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Permission>;
export declare const getUpdatePermissionMutationKey: () => readonly ["updatePermission"];
export declare const getUpdatePermissionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePermission>>, TError, UpdatePermissionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePermission>>, TError, UpdatePermissionMutationVariables, TContext>;
export type UpdatePermissionMutationResult = NonNullable<Awaited<ReturnType<typeof updatePermission>>>;
export type UpdatePermissionMutationBody = BodyType<PermissionUpdate>;
export type UpdatePermissionMutationError = ErrorType<unknown>;
export type UpdatePermissionMutationVariables = {
    id: number;
    data: BodyType<PermissionUpdate>;
};
/**
* @summary Update a privacy permission
*/
export declare const useUpdatePermission: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePermission>>, TError, UpdatePermissionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePermission>>, TError, UpdatePermissionMutationVariables, TContext>;
export declare const getGetProfileUrl: () => string;
/**
 * @summary Get the current profile
 */
export declare const getProfile: (options?: Parameters<typeof customFetch>[1]) => Promise<Profile>;
export declare const getGetProfileQueryKey: () => readonly ["/api/profile"];
export declare const getGetProfileQueryOptions: <TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getProfile>>>;
export type GetProfileQueryError = ErrorType<unknown>;
/**
 * @summary Get the current profile
 */
export declare function useGetProfile<TData = Awaited<ReturnType<typeof getProfile>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProfile>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProfileUrl: () => string;
/**
 * @summary Update profile
 */
export declare const updateProfile: (profileUpdate: ProfileUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Profile>;
export declare const getUpdateProfileMutationKey: () => readonly ["updateProfile"];
export declare const getUpdateProfileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, UpdateProfileMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, UpdateProfileMutationVariables, TContext>;
export type UpdateProfileMutationResult = NonNullable<Awaited<ReturnType<typeof updateProfile>>>;
export type UpdateProfileMutationBody = BodyType<ProfileUpdate>;
export type UpdateProfileMutationError = ErrorType<unknown>;
export type UpdateProfileMutationVariables = {
    data: BodyType<ProfileUpdate>;
};
/**
* @summary Update profile
*/
export declare const useUpdateProfile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProfile>>, TError, UpdateProfileMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProfile>>, TError, UpdateProfileMutationVariables, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map