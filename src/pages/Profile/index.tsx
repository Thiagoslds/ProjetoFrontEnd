import React, {useCallback, useRef} from 'react';
import {FiArrowLeft, FiUser, FiMail, FiLock, FiCamera} from 'react-icons/fi';
import {Form} from '@unform/web' //criado pela rocketseat para manipular eventos
import * as Yup from 'yup'; //modulo para capturar e manipular erros
import getValidationErrors from '../../utils/getValidationErrors';
import {Link, useHistory} from 'react-router-dom';
import api from '../../services/api';
import {useToast} from '../../hooks/ToastContext'

import Button from '../../components/Button';
import Input from '../../components/Input';

import {Container, Content, AvatarInput } from './styles';
import { FormHandles } from '@unform/core';
import { useAuth } from '../../hooks/AuthContext';

interface ProfileFormData{
    name: string;
    email: string;
    password: string;
}

const Profile: React.FC = () => {
    const formRef = useRef<FormHandles>(null); /*useref para acessar os valores do formulario, para 
    manipular o erro, setar, limpar, etc 
    Para ter acesso depois com a constante formref, usa o formhandles do modulo unform rocketseat*/
    const{addToast} = useToast();
    const history = useHistory(); 
    const {user} = useAuth();

    /*Função para manipular os dados enviados do formulario, usando modulo callback, que serve
    para utilizar funções dentro de funções, sendo chamada uma vez para não sobrecarregar;
    o segundo parametro é uma variavel que setada e modificada altera a função*/ 
    const handleSubmit = useCallback(async (data: ProfileFormData) => {
        try{
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({ /*validar o objeto data inteiro que vai ter o 
                formato shape a ser definido */
                name: Yup.string().required('Nome Obrigatório'),
                email: Yup.string().required('E-mail obrigatório').email('Digite um e-mail válido'),
                password: Yup.string().min(6, 'No mínimo 6 dígitos')
            });

            await schema.validate(data, {
                abortEarly: false //para nao abortat quando pegar o primeiro erro
            }); //assincrono para verificar se o data é válido

            await api.post('/users', data);

            history.push('/'); //Redireciona depois de cadastrado para a pagina inicial

            addToast({
                type: 'success',
                title: 'Cadastro realizado!',
                description: 'Você já pode fazer seu logon no GoBarber!'
            });

        } catch(err){
               /*Se for um erro de validação gerado pelo Yup*/
            if(err instanceof Yup.ValidationError){
                const errors = getValidationErrors(err); //passa o erro para a função criada
                formRef.current?.setErrors(errors); /*interrogação para verificar se a variavel existe 
                seta os erros no formulario, é criado pelo getvalidationerrors do tipo especifico*/

                return;
            }
            addToast({
                 type: 'error',
                 title: 'Erro no cadastro',
                 description: 'Ocorreu um erro ao fazer cadastro'
            });
        }
    }, [addToast, history]);
    
    
    return (
    <Container>
        <header>
            <div>
                <Link to="/dashboard">
                    <FiArrowLeft />
                </Link> 
            </div>
        </header>
        <Content>
                <Form ref={formRef} initialData={{ /*mostra os dados do perfil*/
                    name: user.name,
                    email: user.email
                }} onSubmit={handleSubmit}> 
                    <AvatarInput>
                        <img src={user.avatar_url} alt={user.name} />
                        <button type="button">
                            <FiCamera />
                        </button>
                    </AvatarInput>
                    
                    <h1>Meu perfil</h1>

                    <Input name="name" icon={FiUser} placeholder="Nome" />
                    <Input name="email" icon={FiMail} placeholder="E-mail" />
                    <Input containerStyle={{marginTop: 24}} name="old_password" icon={FiLock} 
                        type="password" placeholder="Senha atual" />
                    <Input name="password" icon={FiLock} 
                        type="password" placeholder="Nova Senha" />
                    <Input name="password_confirmation" icon={FiLock} 
                        type="password" placeholder="Confirmar Senha" />
                    <Button type="submit">Confirmar mudanças</Button>
                </Form>
        </Content>

        
    </Container>

    );}

export default Profile ;