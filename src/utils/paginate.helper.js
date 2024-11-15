class FilterStrategy {
    apply(filter, search) {
        if (search) {
            const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedSearch = escapeRegex(search);
            const searchValue = { $regex: escapedSearch, $options: 'i' };
            filter.$or = [
                { name: searchValue },
                { 'info.fullName': searchValue },
                { username: searchValue },
                { serialNumberStr: searchValue }
            ];
        }
        return filter;
    }
}

class SortStrategy {
    apply(sort) {
        return sort;
    }
}

class SelectStrategy {
    apply(query, select) {
        return select ? query.select(select) : query;
    }
}

class PopulateStrategy {
    apply(query, populate) {
        return populate ? query.populate(populate) : query;
    }
}

export async function paginate(
    model,
    { page = 1, limit = 10, filter = {}, sort = { createdAt: -1 }, populate = null, select = null, search } = {}
) {
    const skip = (page - 1) * limit;

    const filterStrategy = new FilterStrategy();
    const sortStrategy = new SortStrategy();
    const selectStrategy = new SelectStrategy();
    const populateStrategy = new PopulateStrategy();

    const modifiedFilter = filterStrategy.apply(filter, search);
    const modifiedSort = sortStrategy.apply(sort);

    let query = model.find(modifiedFilter).sort(modifiedSort).skip(skip).limit(limit);

    query = selectStrategy.apply(query, select);
    query = populateStrategy.apply(query, populate);

    const [total, items] = await Promise.all([model.countDocuments(modifiedFilter), query.exec()]);

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return {
        items,
        page,
        limit,
        totalPages,
        total,
        nextPage,
        prevPage
    };
}
