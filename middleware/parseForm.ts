import nextConnect from 'next-connect';
import multiparty from 'multiparty';

const parseForm = nextConnect();

parseForm.use(async (req: any, res, next) => {
    const form: multiparty.Form = new multiparty.Form();

    form.parse(req, (_, fields, files) => {
        req.body = fields;
        req.files = files;
        next();
    });
});

export default parseForm;
