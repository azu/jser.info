#!/usr/bin/env bash
# https://github.com/jser/realtime.jser.info を更新する
declare currentDir=$(cd $(dirname $0);pwd)
declare nextWeekNumber=$(node "${currentDir}/jser.github.io/bin/get-next-week-number.js")
declare branchName="jser-week-${nextWeekNumber}"
declare currentYear=`date +'%Y'`
declare currentDate=`date +%Y-%m-%d`

# http://rcmdnk.github.io/blog/2013/12/08/computer-bash/
tmpDir=$(mktemp -d 2>/dev/null||mktemp -d -t tmp)

git clone --depth 1 https://github.com/jser/jser.github.io.git "${tmpDir}/jser.github.io"
cd "${tmpDir}/jser.github.io/"

git checkout -B "${branchName}"
git pull origin "${branchName}" --no-edit 2>/dev/null
# e.g) _i18n/ja/_posts/2017
mkdir -p "${tmpDir}/jser.github.io/_i18n/ja/_posts/${currentYear}"
# rm prev draft
node "${currentDir}/jser.github.io/bin/rm-draft.js" \
    --baseDir "${tmpDir}/jser.github.io/_i18n/ja/_posts/${currentYear}" --weekNumber "${nextWeekNumber}"
node "${currentDir}/jser.github.io/bin/generate-next-draft.js" \
    --output "${tmpDir}/jser.github.io/_i18n/ja/_posts/${currentYear}/${currentDate}-${nextWeekNumber}draft.md"

# Git Commit
git ls-files -co --exclude-standard "${tmpDir}/jser.github.io/_i18n/ja/_posts/${currentYear}/*draft.md" | xargs git add
git commit -m "Update ${nextWeekNumber} draft"
# Git Push
echo "git push draft"

if [ -z "${GH_TOKEN}" ]; then
    git push --quiet "https://github.com/jser/jser.github.io.git" ${branchName}:${branchName} > /dev/null
else
    git push --quiet "https://${GH_TOKEN}@github.com/jser/jser.github.io.git" ${branchName}:${branchName} > /dev/null
fi
# pop
cd -

