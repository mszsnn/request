#!/bin/bash
set -e
if [[ $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == 'master' ]] || [[ $CI_COMMIT_TAG != '' ]];then
	yarn install --registry=http://npm.fe.sensorsdata.cn/ --cache-folder /tmp/.yarn-${CI_PROJECT_ID}
	npm run build
else
	echo '非合并到 master 的分支的 merge_request 或 非 tag 触发，不进行 build';
fi
