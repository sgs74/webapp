import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
// import { debounce } from 'lodash';

import analytics from '../analytics';
import { search } from '../actions/search';
import { archiveUrl } from '../actions/url';
import { loadSources } from '../actions/source';
import { loadRecentContentUrls } from '../actions/content';
import { selectSessionUser } from '../selectors/session';
import { selectSearchQuery, selectSearchResults } from '../selectors/search';
import { selectRecentContentUrls } from '../selectors/content';
import { selectRecentSources } from '../selectors/sources';

import List from '../components/List';
import SearchResultItem from '../components/item/SearchResultItem';
import ContentItem from '../components/item/ContentItem';
import SourcesRow from '../components/SourcesRow';

class Archives extends React.Component {
  constructor(props) {
    super(props);

    [
      "handleSearchChange",
      "handleClearSearch",
      "handleArchiveUrl",
    ].forEach((m) => { this[m] = this[m].bind(this); });
  }

  componentWillMount() {
    analytics.page('archives');
    this.props.loadRecentContentUrls(1, 25);
    this.props.loadSources(1, 3);
  }

  handleSearchChange(e) {
    this.props.search(e.target.value);
  }
  handleClearSearch() {
    this.props.search("");
  }

  handleArchiveUrl(url) {
    this.props.archiveUrl(url).then(() => {
      browserHistory.push(`/url?url=${url}`);
    });
  }

  renderArchiveUrl() {
    const { query, results } = this.props;
    if (query && query.length > 4 && !results.find(r => r.url == query)) {
      return (
        <div className="row">
          <div className="col-md-12">
            <h6>Hrm... looks like we don&apos;t have a record for that url.</h6>
            <p>Would You Like to try to archive it?</p>
            <button className="btn btn-primary" onClick={this.handleArchiveUrl.bind(this, query)}>Archive Url</button>
          </div>
        </div>
      );
    }

    return undefined;
  }

  renderSearchResults() {
    return (
      <div className="row">
        <div className="col-md-12">
          <label className="label">results</label>
        </div>
        <List component={SearchResultItem} data={this.props.results} />
      </div>
    );
  }

  renderRecentContent() {
    return (
      <div>
        <SourcesRow data={this.props.sources} label="Recent Sources:" />
        <div className="row">
          <div className="col-md-12">
            <hr />
            <label className="label">New Content Needing Metadata:</label>
          </div>
          <List component={ContentItem} data={this.props.recentContent} />
        </div>
      </div>
    );
  }

  render() {
    const { query, results } = this.props;

    return (
      <div id="home" className="page">
        <div className="user container">
          <div className="row">
            <header className="orange col-md-12">
              <div className="form-group">
                <label className="form-label label">search archives</label>
                <input className="form-control" value={query} onChange={this.handleSearchChange} />
              </div>
            </header>
          </div>
          {results.length ?
            this.renderSearchResults() :
            this.renderRecentContent()
          }
          {this.renderArchiveUrl()}
        </div>
      </div>
    );
  }
}

Archives.propTypes = {
  // pages: PropTypes.object.isRequired,
  search: PropTypes.func.isRequired,
};

Archives.defaultProps = {
};

function mapStateToProps(state, ownProps) {
  const session = selectSessionUser(state);
  return Object.assign({
    session,
    query: selectSearchQuery(state),
    results: selectSearchResults(state),
    recentContent: selectRecentContentUrls(state),
    sources: selectRecentSources(state),
  }, ownProps);
}

export default connect(mapStateToProps, {
  loadSources,
  loadRecentContentUrls,
  archiveUrl,
  search,
})(Archives);
