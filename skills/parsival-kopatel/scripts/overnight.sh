#!/usr/bin/env bash
set -u

GOAL="${KOPATEL_OVERNIGHT_GOAL:-}"
WORK_DIR="${KOPATEL_OVERNIGHT_WORKDIR:-$PWD}"
MAX_ITERATIONS="${KOPATEL_OVERNIGHT_MAX_ITERATIONS:-40}"
SLEEP_ON_FAIL_MINUTES="${KOPATEL_OVERNIGHT_SLEEP_ON_FAIL_MINUTES:-15}"
MAX_CONSECUTIVE_FAILS="${KOPATEL_OVERNIGHT_MAX_CONSECUTIVE_FAILS:-5}"
AGENT_CMD="${KOPATEL_OVERNIGHT_AGENT_CMD:-claude --print --permission-mode acceptEdits}"

usage() {
  cat >&2 <<'EOF'
Usage: overnight.sh --goal GOAL.md [--work-dir DIR] [--max-iterations N]
                    [--sleep-on-fail-minutes N] [--max-consecutive-fails N]
                    [--agent-cmd COMMAND]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --goal)
      GOAL="${2:-}"
      shift 2
      ;;
    --work-dir)
      WORK_DIR="${2:-}"
      shift 2
      ;;
    --max-iterations)
      MAX_ITERATIONS="${2:-}"
      shift 2
      ;;
    --sleep-on-fail-minutes)
      SLEEP_ON_FAIL_MINUTES="${2:-}"
      shift 2
      ;;
    --max-consecutive-fails)
      MAX_CONSECUTIVE_FAILS="${2:-}"
      shift 2
      ;;
    --agent-cmd)
      AGENT_CMD="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 64
      ;;
  esac
done

is_positive_int() {
  case "$1" in
    ''|*[!0-9]*)
      return 1
      ;;
  esac
  [ "$1" -gt 0 ]
}

is_nonnegative_int() {
  case "$1" in
    ''|*[!0-9]*)
      return 1
      ;;
  esac
  return 0
}

if [ -z "$GOAL" ]; then
  echo "--goal is required" >&2
  usage
  exit 64
fi
if [ ! -f "$GOAL" ]; then
  echo "Goal file not found: $GOAL" >&2
  exit 64
fi
if [ ! -d "$WORK_DIR" ]; then
  echo "WorkDir not found or not a directory: $WORK_DIR" >&2
  exit 64
fi
if ! is_positive_int "$MAX_ITERATIONS"; then
  echo "--max-iterations must be a positive integer" >&2
  exit 64
fi
if ! is_nonnegative_int "$SLEEP_ON_FAIL_MINUTES"; then
  echo "--sleep-on-fail-minutes must be a non-negative integer" >&2
  exit 64
fi
if ! is_positive_int "$MAX_CONSECUTIVE_FAILS"; then
  echo "--max-consecutive-fails must be a positive integer" >&2
  exit 64
fi

mkdir -p "$WORK_DIR/logs" || exit 1
STATUS_FILE="$WORK_DIR/STATUS.md"

append_status() {
  printf '%s\n' "$1" >> "$STATUS_FILE"
}

terminal_state() {
  local has_done=0
  local has_blocked=0

  if [ -f "$WORK_DIR/.done" ]; then
    has_done=1
  elif [ -f "$STATUS_FILE" ] && grep -Eq 'DONE:' "$STATUS_FILE"; then
    has_done=1
  fi

  if [ -f "$WORK_DIR/.blocked" ]; then
    has_blocked=1
  elif [ -f "$STATUS_FILE" ] && grep -Eq '^BLOCKED:' "$STATUS_FILE"; then
    has_blocked=1
  fi

  if [ "$has_done" -eq 1 ] && [ "$has_blocked" -eq 1 ]; then
    echo "blocked"
  elif [ "$has_done" -eq 1 ]; then
    echo "done"
  elif [ "$has_blocked" -eq 1 ]; then
    echo "blocked"
  else
    echo "running"
  fi
}

run_agent() {
  local input_text="$1"
  local log_path="$2"
  (
    cd "$WORK_DIR" || exit 1
    printf '%s' "$input_text" | bash -lc "$AGENT_CMD"
  ) > "$log_path" 2>&1
}

PREFLIGHT_LOG="$WORK_DIR/logs/preflight.log"
run_agent $'hi\n' "$PREFLIGHT_LOG"
preflight_exit=$?
if [ "$preflight_exit" -ne 0 ]; then
  message="FAILED: pre-flight smoke failed with exit code $preflight_exit"
  append_status "$message"
  echo "$message. See $PREFLIGHT_LOG." >&2
  exit 1
fi

GOAL_TEXT="$(cat "$GOAL")"
consecutive_fails=0
iteration=1

while [ "$iteration" -le "$MAX_ITERATIONS" ]; do
  state="$(terminal_state)"
  if [ "$state" = "done" ]; then
    exit 0
  fi
  if [ "$state" = "blocked" ]; then
    exit 2
  fi

  iter_log="$WORK_DIR/logs/iter-$iteration.log"
  if run_agent "$GOAL_TEXT" "$iter_log"; then
    consecutive_fails=0
  else
    agent_exit=$?
    consecutive_fails=$((consecutive_fails + 1))
    if [ "$consecutive_fails" -ge "$MAX_CONSECUTIVE_FAILS" ]; then
      message="FAILED: agent exited $agent_exit for $consecutive_fails consecutive iterations"
      append_status "$message"
      echo "$message. See $iter_log." >&2
      exit 1
    fi
    if [ "$SLEEP_ON_FAIL_MINUTES" -gt 0 ]; then
      sleep $((SLEEP_ON_FAIL_MINUTES * 60))
    fi
  fi

  iteration=$((iteration + 1))
done

state="$(terminal_state)"
if [ "$state" = "done" ]; then
  exit 0
fi
if [ "$state" = "blocked" ]; then
  exit 2
fi

append_status "HALTED: max iterations reached ($MAX_ITERATIONS)"
exit 3
