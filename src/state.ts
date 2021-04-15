import { Subject, merge, EMPTY } from 'rxjs';
import { startWith, withLatestFrom, map, pluck, switchMap, switchMapTo, catchError } from 'rxjs/operators';
import { bind, shareLatest, SUSPENSE } from '@react-rxjs/core';
import { getIssues, getRepoOpenIssuesCount } from 'api/githubAPI';

export const INITIAL_ORG = 'rails';
export const INITIAL_REPO = 'rails';

const repoSubject$ = new Subject<{ org: string; repo: string }>();
export const onLoadRepo = (org: string, repo: string) => {
    repoSubject$.next({ org, repo });
};

const pageSelected$ = new Subject<number>();
export const onPageChange = (nextPage: number) => {
    pageSelected$.next(nextPage);
};

export const issueSelected$ = new Subject<number | null>();
export const onIssueSelected = (id: number) => {
    issueSelected$.next(id);
};

export const [useCurrentRepo, currentRepo$] = bind(
    repoSubject$.pipe(
        startWith({
            org: INITIAL_ORG,
            repo: INITIAL_REPO,
        }),
    ),
);

export const currentRepoAndPage$ = merge(
    currentRepo$.pipe(
        map(currentRepo => ({
            ...currentRepo,
            page: 1,
        })),
    ),
    pageSelected$.pipe(
        withLatestFrom(currentRepo$),
        map(([page, repo]) => ({ ...repo, page })),
    ),
).pipe(shareLatest());

export const [useCurrentPage] = bind(currentRepoAndPage$.pipe(pluck('page')));

export const [useIssues, issues$] = bind(
    currentRepoAndPage$.pipe(switchMap(({ page, repo, org }) => getIssues(org, repo, page).pipe(startWith(SUSPENSE)))),
);

export const [useOpenIssuesLen, openIssuesLen$] = bind(
    currentRepo$.pipe(switchMap(({ org, repo }) => getRepoOpenIssuesCount(org, repo).pipe(startWith(SUSPENSE)))),
);

currentRepoAndPage$.pipe(switchMapTo(merge(issues$, openIssuesLen$).pipe(catchError(() => EMPTY)))).subscribe();

export const [useSelectedIssueId, selectedIssueId$] = bind(issueSelected$.pipe(startWith(null)));
