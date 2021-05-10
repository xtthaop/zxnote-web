import styled from 'styled-components'

export const PreviewWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
`

export const Previewer = styled.div`
  width: 50%;
  height: 100%;
  padding: 30px;
  box-sizing: border-box;
  background: #fcfaf2;
  overflow-y: scroll;
  scroll-behavior: smooth;
`

export const TitleWrapper = styled.h1`
  line-height: 1.75;
  margin-bottom: 20px;
  font-size: 26px;
  font-weight: 600;
`

export const ContentWrapper = styled.div`
  font-size: 16px;
  line-height: 1.7;

  h1, h2, h3, h4, h5, h6{
    text-rendering: optimizelegibility;
    line-height: 1.7;
    margin: 0 0 15px;
  }

  h1{ font-size: 26px; }
  h2{ font-size: 24px; }
  h3{ font-size: 22px; }
  h4{ font-size: 20px; }
  h5{ font-size: 18px; }
  h6{ font-size: 16px; }

  p{
    margin: 0 0 15px;
    word-break: break-word;
  }

  em{ font-style: italic; }

  blockquote{
    padding: 20px;
    background-color: #f2f2f2;
    border-left: 6px solid #b3b3b3;
    word-break: break-word;
    font-size: 16px;
    font-weight: 400;
    line-height: 30px;
    margin: 0 0 20px;

    p:last-child{
      margin-bottom: 0;
    }
  }

  hr{
    margin: 0 0 20px;
    border: 0;
    border-top: 1px solid #d9d9d9 !important;
  }

  a{
    text-decoration: none;
    background-color: transparent;
    outline: none;
    cursor: pointer;
  }

  ul{
    list-style-type: disc;
    word-break: break-word;
    margin: -5px 0 20px 20px;

    li{
      line-height: 30px;

      ol{
        margin-top: 15px;
      }
    }
  }

  ol{
    list-style-type: decimal;
    word-break: break-word;
    margin: -5px 0 20px 20px;

    li{
      line-height: 30px;

      ul{
        margin-top: 15px;
      }
    }
  }

  table{
    width: 100%;
    margin-bottom: 20px;
    border: 1px solid #d9d9d9;
    border-collapse: collapse;
    border-left: none;
    word-break: normal;

    tr:nth-of-type(2n) {
      background-color: hsla(0,0%,71%,.1);
    }

    td, th{
      padding: 8px;
      border: 1px solid #d9d9d9;
      line-height: 20px;
      vertical-align: middle;
    }

    th{
      font-weight: 700;
    }

    thead th{
        vertical-align: middle;
        text-align: inherit;
    }
  }

  code{
    padding: 2px 4px;
    background-color: #f6f6f6;
    vertical-align: middle;
    border: none;
    color: #c7254e;
    font-size: 12px;
    white-space: pre-wrap;
  }

  pre{
    word-wrap: normal;
    word-break: break-all;
    white-space: pre;
    overflow: auto;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #d9d9d9;
    border-radius: 0;
    line-height: 20px;
    background-color: #282c34;

    code{
      padding: 0;
      background-color: transparent;
      white-space: pre;
      color: #c0c5ce;
    }
  }

  .image-package{
    text-align: center;
    font-size: 0;
    margin-bottom: 20px;

    img{
      max-width: 100%;
      width: auto;
      height: auto;
    }
  }
`
