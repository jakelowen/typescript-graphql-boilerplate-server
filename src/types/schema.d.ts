// tslint:disable
// graphql typescript definitions

declare namespace GQL {
  interface IGraphQLResponseRoot {
    data?: IQuery | IMutation | ISubscription;
    errors?: Array<IGraphQLResponseError>;
  }

  interface IGraphQLResponseError {
    /** Required for all errors */
    message: string;
    locations?: Array<IGraphQLResponseErrorLocation>;
    /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
    [propName: string]: any;
  }

  interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }

  interface IQuery {
    __typename: "Query";
    teams: ITeamsResults;
    team: ITeamResult;
    me: IUser | null;
  }

  interface ITeamsOnQueryArguments {
    input?: ITeamsInput | null;
  }

  interface ITeamOnQueryArguments {
    input?: ITeamInput | null;
  }

  interface ITeamsInput {
    where?: ITeamWhereInput | null;
    orderBy: Array<ITeamOrdering>;
    limit?: number | null;
    after?: string | null;
    noCache?: boolean | null;
  }

  /**
   * all the ways we want to filter these.
   * Uses filterQuery snippets
   */
  interface ITeamWhereInput {
    AND: Array<ITeamWhereInput>;
    OR: Array<ITeamWhereInput>;
    id_is?: string | null;
    id_not?: string | null;
    id_in: Array<string>;
    id_notin: Array<string>;
    id_lt?: string | null;
    id_lte?: string | null;
    id_gt?: string | null;
    id_gte?: string | null;
    id_contains?: string | null;
    id_notcontains?: string | null;
    id_startswith?: string | null;
    id_notstartswith?: string | null;
    id_endswith?: string | null;
    id_notendswith?: string | null;
    name_is?: string | null;
    name_not?: string | null;
    name_in: Array<string>;
    name_notin: Array<string>;
    name_lt?: string | null;
    name_lte?: string | null;
    name_gt?: string | null;
    name_gte?: string | null;
    name_contains?: string | null;
    name_notcontains?: string | null;
    name_startswith?: string | null;
    name_notstartswith?: string | null;
    name_endswith?: string | null;
    name_notendswith?: string | null;
  }

  /**
   * generic for ordering
   */
  interface ITeamOrdering {
    sort: TeamSort;

    /**
     * @default ASC
     */
    direction: Direction;
  }

  /**
   * the fields we want to allow sort by
   */
  enum TeamSort {
    name = "name"
  }

  enum Direction {
    ASC = "ASC",
    DESC = "DESC"
  }

  /**
   * generic results type
   */
  interface ITeamsResults {
    __typename: "TeamsResults";
    error: Array<IError>;
    items: Array<ITeam>;
    pageInfo: IPageInfo | null;
  }

  interface IError {
    __typename: "Error";
    path: string;
    message: string;
  }

  /**
   * the basic type definition
   */
  interface ITeam {
    __typename: "Team";
    id: string;
    name: string;
    users: Array<IUser>;
  }

  interface IUser {
    __typename: "User";
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    permissions: Array<IPermission>;
  }

  /**
   * the basic type definition
   */
  interface IPermission {
    __typename: "Permission";
    id: string;
    name: string;
    team: ITeam;
  }

  interface IPageInfo {
    __typename: "PageInfo";
    nextCursor: string | null;
    fromCache: boolean | null;
    totalCount: number | null;
  }

  interface ITeamInput {
    where: ITeamWhereUniqueInput;
  }

  /**
   * usually just the types unique identifier
   * used when grabbing only a single item
   */
  interface ITeamWhereUniqueInput {
    id: string;
  }

  interface ITeamResult {
    __typename: "TeamResult";
    error: Array<IError>;
    team: ITeam | null;
  }

  interface IMutation {
    __typename: "Mutation";
    createTeam: ICreateTeamResult;
    updateTeam: IUpdateTeamResult;
    deleteTeam: IDeleteTeamResult;
    sendForgotPasswordEmail: ISendForgotPasswordEmailResponse;
    forgotPasswordChange: IForgotPasswordChangeResponse;
    login: ILoginResponse | null;
    logout: boolean | null;
    addPermission: IAddPermissionResult;
    removePermission: IRemovePermissionResult | null;
    register: IRegisterResponse;
  }

  interface ICreateTeamOnMutationArguments {
    input: ICreateTeamInput;
  }

  interface IUpdateTeamOnMutationArguments {
    input: IUpdateTeamInput;
  }

  interface IDeleteTeamOnMutationArguments {
    input: IDeleteTeamInput;
  }

  interface ISendForgotPasswordEmailOnMutationArguments {
    input: ISendForgotPasswordEmailInput;
  }

  interface IForgotPasswordChangeOnMutationArguments {
    input: IForgotPasswordChangeInput;
  }

  interface ILoginOnMutationArguments {
    input: ILoginInput;
  }

  interface IAddPermissionOnMutationArguments {
    input: IAddPermissionInput;
  }

  interface IRemovePermissionOnMutationArguments {
    input: IRemovePermissionInput;
  }

  interface IRegisterOnMutationArguments {
    input: IRegisterInput;
  }

  interface ICreateTeamInput {
    name: string;
  }

  interface ICreateTeamResult {
    __typename: "CreateTeamResult";
    error: Array<IError>;
    team: ITeam | null;
  }

  interface IUpdateTeamInput {
    id: string;
    name?: string | null;
  }

  interface IUpdateTeamResult {
    __typename: "UpdateTeamResult";
    error: Array<IError>;
    team: ITeam | null;
  }

  interface IDeleteTeamInput {
    id: string;
  }

  interface IDeleteTeamResult {
    __typename: "DeleteTeamResult";
    error: Array<IError>;
    team: ITeam | null;
  }

  interface ISendForgotPasswordEmailInput {
    email: string;
  }

  interface ISendForgotPasswordEmailResponse {
    __typename: "sendForgotPasswordEmailResponse";
    sendForgotPasswordEmail: boolean | null;
  }

  interface IForgotPasswordChangeInput {
    newPassword: string;
    key: string;
  }

  interface IForgotPasswordChangeResponse {
    __typename: "forgotPasswordChangeResponse";
    error: Array<IError>;
    forgotPasswordChange: boolean | null;
  }

  interface ILoginInput {
    email: string;
    password: string;
  }

  interface ILoginResponse {
    __typename: "LoginResponse";
    error: Array<IError>;

    /**
     * if present the auth token
     */
    login: string | null;
  }

  interface IAddPermissionInput {
    permissionName: string;
    teamId: string;
    userId: string;
  }

  interface IAddPermissionResult {
    __typename: "addPermissionResult";
    error: Array<IError>;
    permission: IPermission | null;
  }

  interface IRemovePermissionInput {
    permissionName: string;
    teamId: string;
    userId: string;
  }

  interface IRemovePermissionResult {
    __typename: "removePermissionResult";
    error: Array<IError>;

    /**
     * nulls the name, id of the permission
     */
    permission: IPermission | null;
  }

  interface IRegisterInput {
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
  }

  interface IRegisterResponse {
    __typename: "RegisterResponse";
    error: Array<IError>;
    register: string | null;
  }

  interface ISubscription {
    __typename: "Subscription";
    counter: ICounter;
  }

  interface ICounter {
    __typename: "Counter";
    count: number;
    countStr: string | null;
  }
}

// tslint:enable
