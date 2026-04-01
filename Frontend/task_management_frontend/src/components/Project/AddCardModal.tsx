"use client";

import React from "react";
import { Plus } from "lucide-react";

export type TaskComment = {
  commentId: string;
  comment: string;
  author: string;
  createdAt: string | null;
};

type AddCardComposerProps = {
  value: string;
  disabled: boolean;
  placeholder?: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

const AddCardModal = ({
  value,
  disabled,
  placeholder = "Add a card",
  ariaLabel,
  onChange,
  onSubmit,
}: AddCardComposerProps) => {
  return (
    <div className="mt-3 rounded-lg bg-white/70 p-2 ring-1 ring-slate-200">
      <div className="flex items-center gap-2">
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder={placeholder}
          className="h-9 flex-1 rounded-md border border-slate-200 bg-white/90 px-2 text-sm outline-none ring-sky-300 transition focus:ring"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={ariaLabel}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

type CommentsPanelProps = {
  commentInput: string;
  comments: TaskComment[];
  commentsError: string;
  isLoadingComments: boolean;
  isPostingComment: boolean;
  onCommentChange: (value: string) => void;
  onPostComment: () => void;
  formatCommentTime: (value: string | null) => string;
};

export const CommentsPanel = ({
  commentInput,
  comments,
  commentsError,
  isLoadingComments,
  isPostingComment,
  onCommentChange,
  onPostComment,
  formatCommentTime,
}: CommentsPanelProps) => {
  return (
    <aside className="rounded-xl border border-slate-200 p-4">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Comments</h4>

      <div className="mt-3 flex gap-2">
        <input
          value={commentInput}
          onChange={(event) => onCommentChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onPostComment();
            }
          }}
          placeholder="Write a comment"
          className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none ring-sky-300 transition focus:ring"
        />
        <button
          type="button"
          onClick={onPostComment}
          disabled={isPostingComment}
          className="h-10 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPostingComment ? "Posting..." : "Post"}
        </button>
      </div>

      {commentsError ? <p className="mt-2 text-sm text-red-600">{commentsError}</p> : null}

      <div className="mt-3 max-h-96 space-y-2 overflow-auto pr-1">
        {isLoadingComments ? <p className="text-sm text-slate-500">Loading comments...</p> : null}

        {!isLoadingComments && comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet.</p>
        ) : null}

        {comments.map((item) => (
          <article key={item.commentId} className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium text-slate-700">{item.author}</p>
              <p className="shrink-0 text-[11px] text-slate-500">{formatCommentTime(item.createdAt)}</p>
            </div>
            <p className="text-sm text-slate-800">{item.comment}</p>
          </article>
        ))}
      </div>
    </aside>
  );
};

export default AddCardModal;
