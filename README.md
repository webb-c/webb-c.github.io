# webb-c.github.io

Vaughn Sohn의 홈페이지. GitHub Pages(Jekyll)로 빌드됩니다 — `master`에 push하면 몇 분 뒤 https://webb-c.github.io 에 반영됩니다.

## 무엇을 고치려면 어디를 보면 되나

각 페이지의 부분마다 이름(H-a, A-c, Q-b …)이 붙어 있습니다. 상단 메뉴의 **Captions ON** 버튼을 누르면(또는 주소 뒤에 `?blocks`) 화면에 이름표가 보이고, 코드에서는 `data-block="H-a"`로 찾을 수 있습니다. 켠 상태는 그 브라우저에 기억됩니다.

| 고치고 싶은 것 | 파일 |
| --- | --- |
| 이름, 소속, 이메일, 짧은 소개(bio), 관심 분야, CV·Scholar·GitHub 링크 | `_data/profile.yml` |
| About의 연구 경력 · 학력 | `_data/profile.yml` (`experience`, `education`) |
| About 페이지의 문단 · 레이아웃 · **사진(현재 주석 처리)** | `_pages/about.html` |
| Home 페이지 (첫 화면 문구, 섹션 순서) | `index.html` |
| 논문 추가/수정 (Publications, Home의 Selected) | `_publications/*.md` — 파일 하나가 논문 하나. `selected: 1`, `selected: 2` …면 Selected 목록에 [1], [2]로, Publications 맵에 레벨 01, 02로 나옴. 논문별 페이지는 없음 |
| Publications 맵 (레벨 위치, 길, 레벨마다의 퍼즐) | `_data/puzzles.yml`의 `levels › publications › map` — `nodes`(레벨 위치), `paths`(`after: n`이면 레벨 n을 깬 뒤 열림), `puzzles`(논문 번호별 퍼즐) |
| Publications 페이지 구성 | `_pages/publications.html` |
| 논문 한 줄(저자·제목·링크·BibTeX) 모양 | `_includes/paper-ref.html` |
| 발표 추가/수정 | `_talks/*.md` — 파일 하나가 발표 하나 |
| Talks 페이지 구성 / 발표 한 줄 모양 | `_pages/talks.html` / `_includes/talk.html` |
| 블로그 글 쓰기 (브라우저에서) | https://webb-c.github.io/admin/ → “Sign In Using Access Token” (아래 참고) |
| 블로그 글 쓰기 (파일로) | `_posts/YYYY-MM-DD-주소.md` (템플릿: `_drafts/new-post-template.md`) |
| 브라우저 편집기(/admin)에서 고칠 수 있는 항목 | `admin/config.yml` |
| 블로그 첫 화면 · 사이드바 · 전체 글 목록 | `blog/index.html` · `_includes/blog-sidebar.html` · `_pages/blog-archive.html` |
| 블로그 글 하나의 레이아웃 (댓글 포함) | `_layouts/post.html` |
| 상단 메뉴 / 하단 footer | `_includes/nav.html` / `_includes/footer.html` |
| 퍼즐 내용 (단어 위치, 오브젝트, 게이트, 첫 방문 화면, 튜토리얼) | `_data/puzzles.yml` |
| 각 페이지의 퍼즐 그림 캡션 | 해당 페이지 파일의 `{% include board.html ... caption="..." %}` |
| 퍼즐 전체 끄기 | `_config.yml`의 `puzzles: false` |
| 색상(라이트/다크), 글꼴, 간격 등 모든 스타일 | `assets/css/site.css` (맨 위 1번 섹션이 색상) |
| 퍼즐 동작(게임 로직, Baba Is You 규칙) | `assets/js/puzzle.js` |
| 다크 모드 버튼, 논문 필터, 블로그 검색 | `assets/js/site.js` |
| 사이트 제목·설명, 블로그 페이지당 글 수, 댓글(giscus) | `_config.yml` |
| CV PDF | `files/CV.pdf` (같은 이름으로 덮어쓰기) |

## 브라우저에서 글쓰기 (/admin)

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
   - Repository access: **Only select repositories** → `webb-c.github.io`
   - Permissions → Repository permissions → **Contents: Read and write**
2. https://webb-c.github.io/admin/ 에서 **Sign In Using Access Token** → 토큰 붙여넣기 (이 브라우저에만 저장됨)
3. Blog posts / Publications / Talks를 고르고 쓰기 → **Save**를 누르면 master에 커밋되고, 1–2분 뒤 사이트에 반영됩니다.
   - 블로그 글의 Address는 영어 소문자와 하이픈(예: `surface-gkp-notes`) — 글 주소가 됩니다.
   - Published를 끄면 사이트에 안 보이는 초안으로 저장됩니다.

## 로컬에서 미리 보기

```bash
bundle install
bundle exec jekyll serve      # http://localhost:4000
bundle exec jekyll serve --drafts   # _drafts 글도 같이 보기
```

## 예전 파일

이전 academicpages 테마의 파일은 `_old/`에 모아 두었습니다. Jekyll은 `_`로 시작하는 폴더를 빌드하지 않으므로 사이트에는 영향이 없고, 필요 없으면 폴더째 지워도 됩니다.
