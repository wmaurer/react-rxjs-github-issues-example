import React, { MouseEvent } from 'react';

import { Issue } from 'api/githubAPI';
import { shorten } from 'utils/stringUtils';

import { IssueLabels } from 'components/IssueLabels';
import { UserWithAvatar } from 'components/UserWithAvatar';

import styles from './IssueListItem.module.css';
import { onIssueSelected } from 'state';

export const IssueListItem = ({ number, title, labels, user, comments, body = '' }: Issue) => {
    const onIssueClicked = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onIssueSelected(number);
    };

    const pluralizedComments = comments === 1 ? 'comment' : 'comments';

    return (
        <div className={styles.issue}>
            <UserWithAvatar user={user} />
            <div className="issue__body">
                <a href="#comments" onClick={onIssueClicked}>
                    <span className={styles.number}>#{number}</span>
                    <span className={styles.title}>{title}</span>
                </a>
                <br /> ({comments} {pluralizedComments})<p className="issue__summary">{shorten(body)}</p>
                <IssueLabels labels={labels} className={styles.label} />
            </div>
        </div>
    );
};
