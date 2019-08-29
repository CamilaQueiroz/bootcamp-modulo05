import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import Container from '../../components/container';
import ErrorMessage from '../../components/errorMessage';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  // eslint-disable-next-line
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    errorMessage: '',
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true });
    const { newRepo, repositories } = this.state;
    const response = await api
      .get(`/repos/${newRepo}`)
      .catch(error => console.log(`erro ${error}`));

    if (!response) {
      this.setState({
        errorMessage: 'Repositorio não encontrado',
        loading: false,
      });
      return;
    }

    const data = {
      name: response.data.full_name,
    };

    const findRepository = repositories.some(
      repo => repo.name.toLowerCase() === newRepo.toLowerCase()
    );

    if (findRepository) {
      this.setState({
        errorMessage: 'O repositório já está na lista',
        loading: false,
      });
    } else {
      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
        errorMessage: '',
      });
    }
  };

  render() {
    // eslint-disable-next-line
    const { newRepo, loading, repositories, errorMessage } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>
        <Form onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Adicionar repositorio"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>
        <ErrorMessage>{errorMessage && <p>{errorMessage}</p>}</ErrorMessage>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
