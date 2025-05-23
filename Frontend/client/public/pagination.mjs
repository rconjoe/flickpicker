export class Pagination {
    static MAX_VISIBLE_PAGINATION_BUTTONS = 5;

    #paginationContainer;
    #selectContainer;
    #onPageChange;
    #totalItems = 0;
    #pageSize;
    #currentPage;

    constructor(parent, onPageChange, defaultPageSize, pageSizes, pageSizeSelectId) {
        this.#onPageChange = onPageChange;
        this.#pageSize = defaultPageSize;
        this.#currentPage = 1;

        this.#selectContainer = document.createElement('div');
        this.#selectContainer.className = 'd-flex align-items-center gap-2';

        this.#paginationContainer = document.createElement('div');
        this.#paginationContainer.className = 'pagination mb-0';

        parent.appendChild(this.#selectContainer);
        parent.appendChild(this.#paginationContainer);

        this.#initPageSizeSelect(pageSizes, pageSizeSelectId);
    }

    setTotalItems(totalItems) {
        this.#totalItems = totalItems;
        this.#currentPage = 1;
        this.#updatePagination();
    }

    #initPageSizeSelect(pageSizes, selectId) {
        this.#selectContainer.innerHTML = '';

        if (Array.isArray(pageSizes) && pageSizes.length > 0) {
            const selectedPageSize = pageSizes.includes(this.#pageSize)
                ? this.#pageSize
                : pageSizes[0];

            const options = pageSizes
                .map(size => `<option value="${size}">${size}</option>`)
                .join('');

            const sizeSelect = document.createElement('select');
            sizeSelect.id = selectId;
            sizeSelect.className = 'form-select w-auto';
            sizeSelect.innerHTML = options;
            sizeSelect.value = selectedPageSize;

            sizeSelect.addEventListener('change', (e) => {
                this.#pageSize = parseInt(e.target.value, 10);
                this.#currentPage = 1;
                this.#onPageChange(this.#currentPage, this.#pageSize);
                this.#updatePagination();
            });

            const sizeSelectLabel = document.createElement('label');
            sizeSelectLabel.htmlFor = selectId;
            sizeSelectLabel.className = 'form-label mb-0';
            sizeSelectLabel.textContent = 'Items per page:';

            this.#selectContainer.appendChild(sizeSelectLabel);
            this.#selectContainer.appendChild(sizeSelect);
        }
    }

    #updatePagination() {
        if (!this.#totalItems || this.#pageSize <= 0) return;

        const pages = [];
        const totalPages = Math.ceil(this.#totalItems / this.#pageSize);
        this.#paginationContainer.innerHTML = '';

        // Previous button
        const prevItem = this.#getPaginationItem("&laquo;",
            this.#currentPage === 1 ? 'disabled' : '',
            (e) => {
                e.preventDefault();
                if (this.#currentPage > 1) {
                    this.#currentPage--;
                    this.#onPageChange(this.#currentPage, this.#pageSize);
                    this.#updatePagination();
                }
            });
        this.#paginationContainer.appendChild(prevItem);

        // Main numbered buttons
        if (totalPages <= Pagination.MAX_VISIBLE_PAGINATION_BUTTONS) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1); // always show first

            if (this.#currentPage > 3) pages.push('ellipsis');

            const start = Math.max(2, this.#currentPage - 1);
            const end = Math.min(totalPages - 1, this.#currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (i !== 1 && i !== totalPages) pages.push(i);
            }

            if (this.#currentPage < totalPages - 2) pages.push('ellipsis');

            if (totalPages > 1) pages.push(totalPages); // always show last
        }

        pages.forEach((page) => {
            const item = page === "ellipsis"
                ? this.#getPaginationItem('...', 'disabled')
                : this.#getPaginationItem(
                    page,
                    this.#currentPage === page ? 'active' : '',
                    (e) => {
                        e.preventDefault();
                        this.#currentPage = page;
                        this.#onPageChange(this.#currentPage, this.#pageSize);
                        this.#updatePagination();
                    });
            this.#paginationContainer.appendChild(item);
        });

        // Next button
        const nextItem = this.#getPaginationItem("&raquo;",
            this.#currentPage === totalPages ? 'disabled' : '',
            (e) => {
                e.preventDefault();
                if (this.#currentPage < totalPages) {
                    this.#currentPage++;
                    this.#onPageChange(this.#currentPage, this.#pageSize);
                    this.#updatePagination();
                }
            });
        this.#paginationContainer.appendChild(nextItem);
    }

    #getPaginationItem(text, liClass, onClick) {
        const li = document.createElement('li');
        li.className = `page-item ${liClass || ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.innerHTML = text;
        if (onClick) a.addEventListener('click', onClick);
        li.appendChild(a);
        return li;
    }
}