import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';
import Container from '../../components/container';
import { Loading, Owner, IssueList, Pagination } from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };
  // eslint-disable-next-line
  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    stateIssue: 'open',
    disablePrev: true,
    disableNext: false,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });

    this.reload();
  }

  reload = async () => {
    const { match } = this.props;
    const { page, stateIssue } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: stateIssue,
        per_page: 5,
        page,
      },
    });
    console.info(issues.data);
    this.setState({
      issues: issues.data,
    });
  };

  handleStateIssues = async value => {
    await this.setState({ stateIssue: value, page: 1 });
    this.reload();
  };

  handlePagination = async action => {
    const { page, issues } = this.state;

    const newPage = action === 'next' ? page + 1 : page - 1;
    await this.setState({ page: newPage });

    if (page > 1) {
      this.setState({ disablePrev: false });
    } else {
      this.setState({ disablePrev: true });
    }

    if (issues.length === 0) {
      this.setState({ disableNext: true });
    } else {
      this.setState({ disableNext: false });
    }

    this.reload();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      disableNext,
      disablePrev,
    } = this.state;
    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        {issues.length > 0 && (
          <select onChange={e => this.handleStateIssues(e.target.value)}>
            <option value="all">Todas</option>
            <option value="open" selected>
              Abertas
            </option>
            <option value="closed">Fechadas</option>
          </select>
        )}

        {issues.length > 0 && (
          <IssueList>
            {issues.map(issue => (
              <li key={String(issue.id)}>
                <img src={issue.user.avatar_url} alt={issue.user.login} />
                <div>
                  <strong>
                    <a href={issue.html_url}>{issue.title}</a>
                    {issue.labels.map(label => (
                      <span key={String(label.id)}>{label.name}</span>
                    ))}
                  </strong>
                  <p>{issue.user.login}</p>
                </div>
              </li>
            ))}
          </IssueList>
        )}
        <Pagination>
          <button
            disabled={disablePrev}
            type="button"
            onClick={() => this.handlePagination('prev')}
          >
            Previous
          </button>
          <button
            disabled={disableNext}
            type="button"
            onClick={() => this.handlePagination('next')}
          >
            Next
          </button>
        </Pagination>
      </Container>
    );
  }
}
