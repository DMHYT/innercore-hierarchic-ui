class ViewParser extends ParserBase {
    _resolve(json) {
        if (typeof(json) === "string") {
            json = { parent_id: json };
        }
        if (json.parent_id) {
            if (typeof(json.parent_id) !== "string") {
                throw "parent_id must be string";
            }
            let resolved;
            if (json.parent_id.startsWith("#")) {
                resolved = this._resolve(this._getCurrentlyEmbedded(json.parent_id));
            } else {
                resolved = this.storage.resolve(ParserStorage.SCOPE_VIEW, json.parent_id);
            }
            if (!resolved) {
                throw `view layout id \"${ json.parent_id }\" was not resolved`;
            }

            delete json.parent_id;
            // noinspection JSUnresolvedFunction
            __assign(json, resolved);
        }
        if (typeof(json) !== "object") {
            throw "view parser must receive object or view layout id";
        }
        return json;
    }

    _parseViews(json) {
        let embeddedViews = [];
        try {
            if (typeof(json) === "object") {
                let _json = {};
                for (let name in json) {
                    if (name === "embedded") {
                        let embeddedViewsJson = json[name];
                        for (let embeddedName in embeddedViewsJson) {
                            embeddedViews.push(embeddedName);
                            this._pushEmbedded(embeddedName, embeddedViewsJson[embeddedName]);
                        }
                    } else {
                        _json[name] = json[name];
                    }
                }
                json = _json;
            }
            json = this._resolve(json);

            if (!json.type) {
                throw "missing view type";
            }
            let factory = ViewParser.getViewFactory(json.type);
            if (!factory) {
                throw "invalid view type: " + json.type;
            }
            let result = factory(this, json, json.type);
            if (!Array.isArray(result)) {
                result = [result];
            }
            return result;
        } finally {
            for(let name of embeddedViews) {
                this._popEmbedded(name);
            }
        }
    }

    // parses json into views array
    parseViews(json, section) {
        if (!section) {
            section = json.id || json.type || "_";
        }
        try {
            this._pushErrorHandlerSection(section);
            let result = this._parseViews(json);
            this._popErrorHandlerSection();
            return result;
        } catch (e) {
            this._reportError(e);
            this._popErrorHandlerSection();
            return [];
        }
    }

    // parse view json, admitting that there must be only one view
    // if multiple views were returned, only first will be used, if none returned, placeholder is used
    // in strict mode, if single view was not parsed, error will be reported and placeholder returned
    parseView(json, strict, section) {
        if (!section) {
            section = json.id || json.type || "_";
        }
        try {
            this._pushErrorHandlerSection(section);
            let views = this._parseViews(json);
            this._popErrorHandlerSection();
            if (strict && views.length !== 1) {
                // this will go directly to error handler
                // noinspection ExceptionCaughtLocallyJS
                throw "parseView in strict mode got not one view from given json";
            }
            return views.length > 0 ? views[0] : this.newPlaceholderView();
        } catch (e) {
            this._reportError(e);
            this._popErrorHandlerSection();
            return this.newPlaceholderView();
        }
    }

    newPlaceholderView() {
        return new UiLinearLayout();
    }

}


ViewParser._viewFactories = {};

ViewParser.addViewFactory = (name, factory) => {
    ViewParser._viewFactories[name] = factory;
}

ViewParser.addDefaultViewFactory = (name, clazz) => {
    ViewParser.addViewFactory(name, (parser, json, type) => {
        let view = new clazz();
        view.parseJson(parser, json);
        return view;
    });
}

ViewParser.getViewFactory = name => {
    return ViewParser._viewFactories[name];
}


EXPORT("ViewParser", ViewParser);
