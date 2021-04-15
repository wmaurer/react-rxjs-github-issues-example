import { bind, SUSPENSE } from '@react-rxjs/core';
import { getComments, getIssue, Issue } from 'api/githubAPI';
import { EMPTY } from 'rxjs';
import { catchError, filter, startWith, switchMap, switchMapTo, withLatestFrom } from 'rxjs/operators';
import { currentRepo$, issueSelected$, selectedIssueId$ } from 'state';

export const onIssueUnselecteed = () => {
    issueSelected$.next(null);
};

export const [useIssue, issue$] = bind(
    selectedIssueId$.pipe(
        filter((id): id is number => id !== null),
        withLatestFrom(currentRepo$),
        switchMap(([id, { org, repo }]) => getIssue(org, repo, id).pipe(startWith(SUSPENSE))),
    ),
);

export const [useIssueComments, issueComments$] = bind(
    issue$.pipe(
        filter((issue): issue is Issue => issue !== SUSPENSE),
        switchMap(issue => getComments(issue.comments_url).pipe(startWith(SUSPENSE))),
    ),
);

selectedIssueId$.pipe(switchMapTo(issueComments$.pipe(catchError(() => EMPTY)))).subscribe();
