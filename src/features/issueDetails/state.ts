import {
  startWith,
  withLatestFrom,
  filter,
  switchMapTo,
  catchError,
  switchMap,
} from 'rxjs/operators'
import { bind, SUSPENSE } from '@react-rxjs/core'
import { Issue, getIssue, getComments } from 'api/githubAPI'
import { issueSelected$, selectedIssueId$, currentRepo$ } from 'state'
import { EMPTY } from 'rxjs'

export const onIssueUnselecteed = () => {
  issueSelected$.next(null)
}

export const [useIssue, issue$] = bind(
  selectedIssueId$.pipe(
    filter((id): id is number => id !== null),
    withLatestFrom(currentRepo$),
    switchMap(([id, { org, repo }]) =>
      getIssue(org, repo, id).pipe(startWith(SUSPENSE))
    )
  )
)

export const [useIssueComments, issueComments$] = bind(
  issue$.pipe(
    filter((issue): issue is Issue => issue !== SUSPENSE),
    switchMap((issue) =>
      getComments(issue.comments_url).pipe(startWith(SUSPENSE))
    )
  )
)

selectedIssueId$
  .pipe(switchMapTo(issueComments$.pipe(catchError(() => EMPTY))))
  .subscribe()
