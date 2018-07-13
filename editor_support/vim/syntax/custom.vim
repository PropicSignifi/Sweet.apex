" Modeline and Notes {
" vim: set sw=4 ts=4 sts=4 et tw=78 foldmarker={,} foldlevel=0 foldmethod=marker spell:
"  __      _________________  __. ____   ____.___   _____
" /  \    /  \__    ___/    |/ _| \   \ /   /|   | /     \
" \   \/\/   / |    |  |      <    \   Y   / |   |/  \ /  \
"  \        /  |    |  |    |  \    \     /  |   /    Y    \
"   \__/\  /   |____|  |____|__ \    \___/   |___\____|__  /
"        \/                    \/                        \/
" Vim configurations for WTK
" }

" General {

    set nocompatible        " Must be first line

    set background=dark         " Assume a dark background

    filetype plugin indent on   " Automatically detect file types.
    syntax on                   " Syntax highlighting
    scriptencoding utf-8
    set encoding=utf-8
    set fileencoding=utf-8

    set shortmess+=filmnrxoOtT          " Abbrev. of messages (avoids 'hit enter')
    set viewoptions=folds,options,cursor,unix,slash " Better Unix / Windows compatibility
    set virtualedit=onemore             " Allow for cursor beyond last character
    set history=1000                    " Store a ton of history (default is 20)
    set hidden                          " Allow buffer switching without saving
    set iskeyword-=.                    " '.' is an end of word designator
    set iskeyword-=#                    " '#' is an end of word designator
    set iskeyword-=-                    " '-' is an end of word designator
    set autoread

    set nobackup
    set noswapfile

" }

" Vim UI {

    set tabpagemax=15               " Only show 15 tabs
    set showmode                    " Display the current mode

    if Koding() != 1
        set cursorline                  " Highlight current line
    endif

    highlight clear SignColumn      " SignColumn should match background
    highlight clear LineNr          " Current line number row will have same background color in relative mode

    if has('cmdline_info')
        set ruler                   " Show the ruler
        set rulerformat=%30(%=\:b%n%y%m%r%w\ %l,%c%V\ %P%) " A ruler on steroids
        set showcmd                 " Show partial commands in status line and
                                    " Selected characters/lines in visual mode
    endif

    if has('statusline')
        set laststatus=2

        " Broken down into easily includeable segments
        set statusline=%<%f\                     " Filename
        set statusline+=%w%h%m%r                 " Options
        set statusline+=\ [%{&ff}/%Y]            " Filetype
        set statusline+=\ [%{getcwd()}]          " Current dir
        set statusline+=%=%-14.(%l,%c%V%)\ %p%%  " Right aligned file nav info
    endif

    set backspace=indent,eol,start  " Backspace for dummies
    set linespace=0                 " No extra spaces between rows
    set number                      " Line numbers on
    set showmatch                   " Show matching brackets/parenthesis
    set incsearch                   " Find as you type search
    set hlsearch                    " Highlight search terms
    set winminheight=0              " Windows can be 0 line high
    set ignorecase                  " Case insensitive search
    set smartcase                   " Case sensitive when uc present
    set completeopt=preview,menu    " Code completion
    set wildmenu                    " Show list instead of just completing
    set wildmode=list:longest,full  " Command <Tab> completion, list matches, then longest common part, then all.
    set whichwrap=b,s,h,l,<,>,[,]   " Backspace and cursor keys wrap too
    set scrolljump=5                " Lines to scroll when cursor leaves screen
    set scrolloff=3                 " Minimum lines to keep above and below cursor
    set foldenable                  " Auto fold code
    set foldmethod=manual           " Manual folding
    if Koding() != 1
        set list
        set listchars=tab:›\ ,trail:•,extends:#,nbsp:. " Highlight problematic whitespace
    endif
    set visualbell                  " do not beep
    set gdefault                    " global search by default

    if WTK_IsGVIM()
        set guioptions-=M " remove menu bar
        set guioptions-=T " remove tool bar
        set guioptions-=r " remove right hand scroll bar
        set guioptions-=L " remove left hand scroll bar
        set guifont=Source\ Code\ Pro:h14
    endif

" }

" Formatting {

    set wrap
    "This will cause auto breaking lines.
    "set textwidth=79
    set formatoptions=qrn1
    set colorcolumn=85
    set autoindent                  " Indent at the same level of the previous line
    set cindent
    set smartindent
    set shiftwidth=4                " Use indents of 4 spaces
    set expandtab                   " Tabs are spaces, not tabs
    set smarttab
    set tabstop=4                   " An indentation every four columns
    set softtabstop=4               " Let backspace delete indent
    set nojoinspaces                " Prevents inserting two spaces after punctuation on a join (J)
    set splitright                  " Puts new vsplit windows to the right of the current
    set splitbelow                  " Puts new split windows to the bottom of the current

    " set header when create new files
    augroup New_File
        autocmd!
        autocmd BufNewFile *tid call s:SetHeader()
        autocmd BufNewFile * normal! G
    augroup END
    func! s:SetHeader()
        if &filetype ==# 'tid'
            call setline(1, "created: ".strftime("%G%m%d%H%M%S000"))
            call append(line("."), "creator: wilson")
            call append(line(".")+1, "modified: ".strftime("%G%m%d%H%M%S000"))
            call append(line(".")+2, "modifier: wilson")
            call append(line(".")+3, "tags: ")
            call append(line(".")+4, "title: ".substitute(substitute(expand("%:t"),"_"," ","g"),"\.tid$","","g"))
            call append(line(".")+5, "type: text/vnd.tiddlywiki")
            call append(line(".")+6, "")
            call append(line(".")+7, "")
        endif
    endfunc

" }

" Key Mappings {

    " Code folding options
    nmap <leader>f0 :set foldlevel=0<CR>
    nmap <leader>f1 :set foldlevel=1<CR>
    nmap <leader>f2 :set foldlevel=2<CR>
    nmap <leader>f3 :set foldlevel=3<CR>
    nmap <leader>f4 :set foldlevel=4<CR>
    nmap <leader>f5 :set foldlevel=5<CR>
    nmap <leader>f6 :set foldlevel=6<CR>
    nmap <leader>f7 :set foldlevel=7<CR>
    nmap <leader>f8 :set foldlevel=8<CR>
    nmap <leader>f9 :set foldlevel=9<CR>

    " Press F7 to enable 'paste' mode
    " Press F8 to disable 'paste' mode
    nnoremap <F7> :set paste<CR>
    nnoremap <F8> :set nopaste<CR>
    inoremap <F7> <C-O>:set paste<CR>
    inoremap <F8> <nop>
    set pastetoggle=<F8>

    " Remap <C-G> to <C-]> to avoid conflicts in web browser
    nnoremap <C-G> <C-]>

    " Map convenient leader key
    " A workaround to map leader key
    map <space> <leader>

    " Avoid escape key
    inoremap jk <esc>

    " Make working with split windows faster
    nnoremap <leader>w <C-w>s<C-w>l

    " Make moving between windows faster
    nnoremap <C-h> <C-w>h
    nnoremap <C-j> <C-w>j
    nnoremap <C-k> <C-w>k
    nnoremap <C-l> <C-w>l

    " Move to background
    nnoremap bg <c-z>

    " Map commonly-used keys
    nmap yl "*yil
    nmap dl "*dil
    vmap Y "*y
    vmap D "*d
    vmap X "*x

    if OSX() ==# 1
        imap <c-v> <c-r>*
    endif

    " Resolve conflicts between completefunc and <c-u> in native vim
    inoremap <c-q> <c-]><c-u>
    cnoremap <c-q> <c-u>

    " MacVim mappings
    if WTK_IsGVIM()
        cnoremap <D-BS> <c-u>
    endif

    nnoremap <a-F5>> :noh<CR>

" }

" Misc {

    " Apply powershell syntax
    au Syntax powershell source ~/wtk/Data/Config/USER_HOME/vim/syntax/powershell.vim

    " Apply puppet syntax
    au Syntax puppet source ~/wtk/Data/Config/USER_HOME/vim/syntax/puppet.vim

    " Apply applescript syntax
    au Syntax applescript source ~/wtk/Data/Config/USER_HOME/vim/syntax/applescript.vim

    " Apply cmd syntax
    au Syntax cmd source ~/wtk/Data/Config/USER_HOME/vim/syntax/cmd.vim

    " Apply cycle syntax
    au Syntax cycle source ~/wtk/Data/Config/USER_HOME/vim/syntax/cycle.vim

    " Apply apex syntax
    au Syntax apex source ~/wtk/Data/Config/USER_HOME/vim/syntax/apex.vim

    au BufReadPost,BufNewFile *.app set syntax=xml
    au BufReadPost,BufNewFile *.cmp set syntax=xml
    au BufReadPost,BufNewFile *.intf set syntax=xml
    au BufReadPost,BufNewFile *.evt set syntax=xml
    au BufReadPost,BufNewFile *.auradoc set syntax=xml
    au BufReadPost,BufNewFile *.cls set syntax=apex
    au BufReadPost,BufNewFile *.apex set syntax=apex

    call WTK_FireEvent("load_user_defined_text_obj")
" }
