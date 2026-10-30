# webb-c.github.io

Vaughn Sohn의 홈페이지. GitHub Pages(Jekyll)로 빌드됩니다 — `master`에 push하면 몇 분 뒤 https://webb-c.github.io 에 반영됩니다.

## 무엇을 고치려면 어디를 보면 되나

각 페이지의 부분마다 이름(H-a, A-c, P-e …)이 붙어 있습니다. 상단 메뉴의 **Captions ON** 버튼을 누르면(또는 주소 뒤에 `?blocks`) 화면에 이름표가 보이고, 코드에서는 `data-block="H-a"`로 찾을 수 있습니다(퍼즐 그림은 `block="H-e"`). 켠 상태는 그 브라우저에 기억됩니다.

> **원칙:** 글자(이름, 소개, 경력, 논문, 발표)는 거의 다 **데이터 파일**(`_data/*.yml`, `_publications/*.md`, `_talks/*.md`, `_posts/*.md`)에 있고, 페이지 파일(`*.html`)은 그걸 배치만 합니다. 페이지 파일에 `{{ profile.xxx }}`가 보이면 `_data/profile.yml`의 `xxx:`를 고치면 됩니다.

### 공통 (모든 페이지)

| 고치고 싶은 것 | 파일 › 위치 |
| --- | --- |
| 이름 (헤더 왼쪽, 홈 제목, footer, 블로그 글쓴이) | `_data/profile.yml` › `name:` |
| 상단 메뉴 [N] 항목 · 순서 | `_includes/nav.html` › `assign items = "about:About:/about/,…"` 한 줄 (`키:보이는 이름:주소`를 쉼표로 이어 씀) |
| 상단 메뉴의 CV 링크 | `_data/profile.yml` › `links: cv:` |
| 하단 footer [F]의 문구 | `_data/profile.yml` › `motto:` / 나머지는 `_includes/footer.html` |
| 브라우저 탭 제목 · 검색엔진 설명 | `_config.yml` › `title:`, `description:` (페이지별 탭 제목은 각 파일 맨 위 `title:`) |
| 파비콘 | `images/favicon.ico` (같은 이름으로 덮어쓰기) |
| 색상 (라이트/다크) | `assets/css/site.css` › **1. Colours** — 위쪽 블록이 라이트, 아래쪽이 다크. `--link`(링크색), `--bg`(배경), `--ink`(글자) 등 |
| 글꼴 | `assets/css/site.css` › **2. Base**의 `--serif`, `--sans`, `--mono` + `_includes/head.html`의 Google Fonts `<link>` (새 글꼴은 둘 다 고쳐야 함) |
| 여백 · 레이아웃 · 목록 · 블로그 · 퍼즐판 모양 | `assets/css/site.css` › 3. Layout pieces / 4. Lists / 5. Blog and posts / 6. Puzzle board |
| 다크 모드 버튼, Captions 버튼, 논문 필터, 블로그 검색의 동작 | `assets/js/site.js` |
| 404 페이지 문구 | `_pages/404.html` › `lede:` |

### Home — `index.html`

| 블록 | 내용 | 고치는 곳 |
| --- | --- | --- |
| H-a | 이름 | `_data/profile.yml` › `name:` |
| H-b | 이름 아래 한 줄 (현재 비어 있음) | `_data/profile.yml` › `tagline:` |
| H-c | "This site is also a small puzzle…" | `index.html` › `data-block="H-c"` 줄의 문장 |
| H-d | Affiliation / Contact / Elsewhere | 값은 `_data/profile.yml` › `affiliation:`, `email:`, `links:` / 칸 구성은 `index.html` › `H-d` |
| H-e, H-f | 퍼즐판 / 그 아래 캡션 | 판 내용은 `_data/puzzles.yml` › `levels: home:` / 캡션은 `index.html` › `include board.html … caption="…"` |
| H-g | "How this site works" 본문 | `index.html` › `H-g` 안의 `<p>` 문단 |
| H-h | 오른쪽 작은 설명 | `index.html` › `H-h` 안의 `<p>` |
| H-i | 1 About (짧은 소개) | `_data/profile.yml` › `bio:` |
| H-j | 2 Selected publications | `_publications/*.md`에서 `selected: 1, 2, …`가 있는 논문만, 번호 순 |
| H-k | 3 Talks (최신 3개) | `_talks/*.md` (개수는 `index.html` › H-k의 `limit: 3`) |
| H-l | 4 From the blog (최신 3개) | `_posts/*.md`의 `title`, `description` (개수는 H-l의 `limit: 3`) |
| — | 섹션 순서 · 번호 · 섹션 제목 | `index.html`에서 `<section>` 덩어리째 위아래로 옮기고 `<span class="num">` 숫자 수정 |

### About — `_pages/about.html`

| 블록 | 내용 | 고치는 곳 |
| --- | --- | --- |
| A-a | "About me" 제목 | `_pages/about.html` › `A-a` |
| A-b | 이름 · 직함, 소속 · 지역 | `_data/profile.yml` › `name`, `role`, `affiliation`, `location` |
| A-c | CV / Email / Scholar / GitHub 버튼 | 링크는 `_data/profile.yml` › `links:`, `email:` / 버튼 추가·삭제는 `about.html` › `A-c` |
| — | 사진 (현재 숨김) | `about.html` 위쪽 `{%- comment -%}` … `{%- endcomment -%}` 블록에서 `<img …>` 한 줄만 남기고 나머지(주석 표시 두 줄과 `PHOTO —` 설명)를 지우면 `images/profile.png`가 보임. 다른 사진은 `images/`에 넣고 `src`의 파일명 수정 |
| A-d, A-e | 퍼즐판 / 캡션 | `_data/puzzles.yml` › `levels: about:` (Bio·CV·Contact 오브젝트와 링크) / 캡션은 `about.html` › `caption="…"` |
| A-f | 1 Bio 본문 | 첫 문단은 `_data/profile.yml` › `bio:` (Home과 공유). 더 긴 글은 `about.html` › `<!-- Add more paragraphs here -->` 자리에 `<p>…</p>` 추가 |
| A-g | Interests / Recent topics | `_data/profile.yml` › `interests:`, `recent_topics:` (한 줄에 `- "…"` 하나씩) |
| A-h | 2 Research experience | `_data/profile.yml` › `experience:` (`dates`, `title`, `detail`; 최신이 위) |
| A-i | 3 Education | `_data/profile.yml` › `education:` (`dates`, `title`, 선택 `detail`) |
| A-j | 4 Contact | 값은 `_data/profile.yml` › `email`, `affiliation`, `location`, `links:` (`cv_updated:`가 "(updated …)" 문구) / 항목 추가는 `about.html` › `A-j`의 `<dt>…</dt><dd>…</dd>` |

### Publications — `_pages/publications.html`

| 블록 | 내용 | 고치는 곳 |
| --- | --- | --- |
| P-a, P-b | 제목 / 소개 문장 | `_pages/publications.html` › `P-a`, `P-b` |
| P-c, P-d | "Selected" 제목 / 지도 설명 문단 | `publications.html` › `P-c`, `P-d` |
| P-e, P-f | 논문 지도 / 캡션 | `_data/puzzles.yml` › `levels: publications: map:` — `nodes`(레벨 위치, `n` = 논문의 `selected` 번호), `paths`(길), `decor`(나무), `puzzles: 1: 2: 3:`(레벨별 퍼즐) / 캡션은 `publications.html` › `caption="…"` |
| P-g | Selected 목록 + 요약 | 각 논문 파일의 `selected:`, `summary:` |
| P-h | "All papers" + 필터 버튼 | `publications.html` › `P-h` (버튼은 `type:` 값 preprint / journal / conference 기준으로 자동 생성) |
| P-i | 연도별 전체 목록 | `_publications/*.md` 전부 (`date:`의 연도로 묶임) |

**논문 하나 = `_publications/파일.md` 하나.** 맨 위 `---` 사이 항목:

| 항목 | 의미 |
| --- | --- |
| `title`, `short_title` | 제목 / 지도·퍼즐에 쓰는 짧은 이름 |
| `authors` | `["A", "B", "Vaughn Sohn"]` — `profile.yml`의 `name`과 같은 이름은 자동으로 굵게 |
| `venue`, `date`, `type` | 학회·저널 이름 / 날짜(정렬·연도) / `preprint`·`journal`·`conference` |
| `selected` | 숫자를 주면 Selected [n] + 지도 레벨 n (지도에 띄우려면 `puzzles.yml`의 `nodes`·`paths`·`puzzles`에도 n 추가) |
| `arxiv`, `doi`, `published`, `pdf`, `code` | 링크 버튼 (arXiv · PDF · Published · Code) |
| `summary`, `bibtex` | Selected 목록의 요약 / 접히는 BibTeX 상자 |

논문 한 줄의 모양(저자 표기, 링크 버튼 종류)은 `_includes/paper-ref.html`.

### Talks — `_pages/talks.html`

| 블록 | 내용 | 고치는 곳 |
| --- | --- | --- |
| T-a, T-b | 제목 / 소개 문장 | `_pages/talks.html` › `T-a`, `T-b` |
| T-c, T-d | 퍼즐판 / 캡션 | `_data/puzzles.yml` › `levels: talks:` (화면 오브젝트는 `slides:`가 있는 최신 발표 3개에서 자동 생성) / 캡션은 `talks.html` › `caption="…"` |
| T-e | Upcoming (오늘 이후 날짜의 발표) | 자동 — 발표 파일의 `date:` |
| T-f | Past (연도별) | 자동 |
| T-g | 발표 한 개의 모양 | `_includes/talk.html` |

**발표 하나 = `_talks/파일.md` 하나.** 항목: `title`(발표 제목, 비우면 행사명 표시), `event`(행사명), `short_title`(퍼즐판용), `date`(정렬용 실제 날짜), `when`(화면에 보이는 날짜 글자), `location`, `slides`, `video`, `paper`. `---` 아래에 쓴 본문은 발표 설명으로 나옵니다. 슬라이드는 `slides/폴더명/`에 넣고 `slides: "/slides/폴더명/"`.

### Blog — `blog/index.html`, `_pages/blog-archive.html`, `_layouts/post.html`

| 블록 | 내용 | 고치는 곳 |
| --- | --- | --- |
| B-a | "Blog" 제목 + "Notes on research…" | `_includes/blog-head.html` (블로그 첫 화면과 All posts 페이지가 공유하는 파일) |
| B-b | "No puzzles in here…" | `_includes/blog-head.html` › `B-b` |
| B-c | Latest / All posts / Series / RSS 탭 | `_includes/blog-head.html` › `<nav class="blog-nav">` |
| B-d | 글 카드 (제목·날짜·발췌·카테고리·태그) | 내용은 각 글 (발췌 = 글의 첫 문단) / 카드 모양은 `blog/index.html` › `B-d` |
| B-e | 페이지 넘기기 | 한 페이지당 글 수는 `_config.yml` › `paginate:` |
| B-f ~ B-j | 사이드바 (검색, 카테고리, 시리즈, 월별, RSS) | `_includes/blog-sidebar.html` |
| BA-a ~ BA-g | All posts 페이지 (날짜·카테고리·태그·시리즈별) | `_pages/blog-archive.html` (BA-a, BA-b는 `blog-head.html`) |
| BP-a ~ BP-c | 글 위쪽 (경로, 제목, 날짜·읽는 시간) | `_layouts/post.html` |
| BP-d | 시리즈 상자 | 글의 `series:`가 같은 글끼리 자동 연결 |
| BP-e | 본문 | 글 파일 본문 |
| BP-f, BP-g | 태그 / 이전·다음 글 | `_layouts/post.html` |
| BP-h | 댓글 (giscus, 현재 꺼짐) | `_config.yml` › `giscus:`의 네 값을 https://giscus.app 에서 받아 채우면 켜짐. 글 하나만 끄려면 그 글에 `comments: false` |

**글 하나 = `_posts/YYYY-MM-DD-주소.md` 하나** (템플릿: `_drafts/new-post-template.md`). 항목: `title`, `lang`(ko/en), `description`(Home에 나오는 한 줄), `categories`, `tags`, `series`, `math: true`(수식), `published: false`(숨김). 브라우저에서 쓰려면 아래 `/admin` 참고 — 편집기에 보이는 입력칸은 `admin/config.yml`에서 바꿉니다.

### 퍼즐 — `_data/puzzles.yml`

| 고치고 싶은 것 | 위치 |
| --- | --- |
| 퍼즐 전체 끄기 | `_config.yml` › `puzzles: false` |
| 모든 판 왼쪽 위 `WEBB IS YOU` | `you:` |
| 아래쪽 게이트 (H A P T B) | `gates:` (`x`가 칸 위치, `url`이 이동할 주소) |
| 첫 방문 화면 문구 · 선택지 | `welcome:` |
| 튜토리얼 3단계 | `tutorial:` |
| 페이지별 판 | `levels:` › `home:` / `about:` / `publications:` / `talks:` — `words`(단어 블록 `[단어, x, y]`), `objects`(별·CV 등), `hint`(판 아래 힌트), `spawn`(시작 위치) |
| 판 좌표 | 18 × 9칸, x = 0–17(왼→오), y = 0–8(위→아래). 맨 아랫줄 y = 8은 게이트 자리 |
| 게임 규칙 자체 (새 단어, 새 속성) | `assets/js/puzzle.js` |
| 전체 화면(F 키) · 게이트로 이동할 때 퍼즐판 위치 유지 | `assets/js/puzzle.js` › `full screen and gate hops` 부분 / 전체 화면 모양은 `assets/css/site.css` › `Full screen (F)` |
| 판 그림 아래 캡션 | 각 페이지의 `{% include board.html … caption="…" %}` |

### 기타

| 고치고 싶은 것 | 파일 |
| --- | --- |
| CV PDF | `files/CV.pdf` (같은 이름으로 덮어쓰기). 이름을 바꾸면 `_data/profile.yml` › `links: cv:`와 `_data/puzzles.yml`의 CV 오브젝트 `url`도 수정 |
| 사이트 주소, 블로그 글 주소 형식, 빌드에서 뺄 파일 | `_config.yml` › `url`, `permalink`, `exclude` |
| 예전 주소 → 새 주소 연결 | 해당 페이지 맨 위 `redirect_from:` |

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
